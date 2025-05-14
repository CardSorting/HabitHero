import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { FC } from "react";

type Role = 'client' | 'therapist' | 'admin';

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
}: {
  path: string;
  component: FC<any>;
  requiredRole?: Role;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {(params) => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }
        
        if (!user) {
          return <Redirect to="/auth" />;
        }
        
        // Check for required role (if specified)
        if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
          return (
            <div className="container mx-auto py-8 text-center">
              <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
              <p className="mb-8">You don't have permission to access this page. This area is restricted to {requiredRole}s.</p>
              <button 
                className="px-4 py-2 bg-primary text-white rounded"
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
            </div>
          );
        }
        
        return <Component user={user} {...params} />;
      }}
    </Route>
  );
}