import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function ClientAuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      fullName: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...userData } = data;
    // Always register as a client from this page
    registerMutation.mutate({ ...userData, role: "client" });
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/today" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background overflow-y-auto">
      {/* App logo and welcome message */}
      <div className="pt-8 pb-4 px-6 text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-primary text-2xl">🌱</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Habit Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">Build better habits, one day at a time</p>
      </div>
      
      {/* Auth Forms */}
      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-8">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="rounded-full">Login</TabsTrigger>
            <TabsTrigger value="register" className="rounded-full">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-0">
            <div className="space-y-6">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Username</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg border-input/50 bg-background"
                            placeholder="Enter your username"
                            {...field}
                            disabled={loginMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Password</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg border-input/50 bg-background"
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                            disabled={loginMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full mt-6 rounded-lg py-6 text-base font-medium"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button
                      variant="link"
                      onClick={() => setActiveTab("register")}
                      className="text-muted-foreground hover:text-primary"
                    >
                      Don't have an account? Register
                    </Button>
                  </div>
                  <div className="text-center mt-2">
                    <Button
                      variant="link"
                      onClick={() => window.location.href = "/therapist-auth"}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      Are you a therapist? Login here
                    </Button>
                  </div>
                </form>
              </Form>
              

            </div>
          </TabsContent>
          
          <TabsContent value="register" className="mt-0">
            <div className="space-y-6">
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Username</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg border-input/50 bg-background"
                            placeholder="Choose a username"
                            {...field}
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg border-input/50 bg-background"
                            placeholder="Enter your full name"
                            {...field}
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Email</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg border-input/50 bg-background"
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Password</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg border-input/50 bg-background"
                            type="password"
                            placeholder="Create a password"
                            {...field}
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg border-input/50 bg-background"
                            type="password"
                            placeholder="Confirm your password"
                            {...field}
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full mt-6 rounded-lg py-6 text-base font-medium"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button
                      variant="link"
                      onClick={() => setActiveTab("login")}
                      className="text-muted-foreground hover:text-primary"
                    >
                      Already have an account? Login
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      

    </div>
  );
}