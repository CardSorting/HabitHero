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

// Utility function to get JSON data from response
export async function getResponseData<T>(response: Response): Promise<T> {
  return await response.json() as T;
}

// Support both function signatures for backward compatibility
// 1. apiRequest(method, url, data)
// 2. apiRequest({ url, method, data })
export async function apiRequest<T = Response>(
  methodOrOptions: string | ApiRequestOptions, 
  urlOrNothing?: string, 
  data?: unknown
): Promise<T> {
  let method: string;
  let url: string;
  let requestData: unknown = undefined;
  
  // Handle both calling styles
  if (typeof methodOrOptions === 'string') {
    // Called as apiRequest(method, url, data)
    method = methodOrOptions;
    url = urlOrNothing || '';
    requestData = data;
  } else {
    // Called as apiRequest({ url, method, data })
    method = methodOrOptions.method;
    url = methodOrOptions.url;
    requestData = methodOrOptions.data;
  }
  
  console.log(`Making ${method} request to ${url}`, requestData);
  
  try {
    // Validate HTTP method
    const validMethod = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase()) ? 
                        method.toUpperCase() : 'GET';
    
    const res = await fetch(url, {
      method: validMethod,
      headers: requestData ? { "Content-Type": "application/json" } : {},
      body: requestData ? JSON.stringify(requestData) : undefined,
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

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
