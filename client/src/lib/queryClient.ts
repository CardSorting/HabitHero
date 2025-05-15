import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export interface ApiRequestOptions {
  url: string;
  method: string;
  data?: unknown;
}

// Fetch with error handling and basic logging 
export async function apiRequest(
  method: string, 
  url: string, 
  data?: unknown
): Promise<Response> {
  console.log(`Making ${method} request to ${url}`, data);
  
  try {
    // Validate HTTP method
    const validMethod = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase()) ? 
                        method.toUpperCase() : 'GET';
    
    const res = await fetch(url, {
      method: validMethod,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    console.log(`Response status: ${res.status} ${res.statusText}`);
    
    // Clone the response before using it (since response body can only be consumed once)
    const resClone = res.clone();
    
    // Try to get response text for debugging
    try {
      const text = await resClone.text();
      console.log(`Response body: ${text}`);
    } catch (e) {
      console.log("Could not read response body for logging:", e);
    }
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

// Helper to get JSON data from a response
export async function getResponseData<T>(response: Response): Promise<T> {
  return await response.json() as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T,>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> => {
  const { on401: unauthorizedBehavior } = options;
  
  return async ({ queryKey }) => {
    try {
      const res = await apiRequest("GET", queryKey[0] as string);
      
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null as unknown as T;
      }
      
      // Parse the response as JSON using our helper
      return await getResponseData<T>(res);
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.startsWith("401") &&
        unauthorizedBehavior === "returnNull"
      ) {
        return null as unknown as T;
      }
      throw e;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
