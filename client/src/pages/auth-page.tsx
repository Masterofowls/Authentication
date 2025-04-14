import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { Loader2, Mail, Lock, ShieldCheck, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { IconLock, IconShieldLock } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { GradientBackground } from "@/components/ui/gradient-background";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  rememberMe: z.boolean().optional()
});

// Register form schema with password confirmation
const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  terms: z.boolean().default(false).refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match"
});

// Reset password schema
const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});

// Form types
type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// Auth page component
export default function AuthPage() {
  const [authState, setAuthState] = useState<"login" | "register" | "resetPassword" | "resetSuccess" | "verifyEmail">("login");
  const { user, isLoading, loginMutation, registerMutation, resetPasswordMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      terms: false
    }
  });

  // Reset password form
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  // Login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password
    });
  };

  // Register form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      email: data.email,
      password: data.password
    }, {
      onSuccess: () => {
        setAuthState("verifyEmail");
      }
    });
  };

  // Reset password form submission
  const onResetPasswordSubmit = (data: ResetPasswordFormValues) => {
    resetPasswordMutation.mutate({
      email: data.email
    }, {
      onSuccess: () => {
        setAuthState("resetSuccess");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <GradientBackground className="overflow-hidden">
      <div className="flex min-h-screen flex-col lg:flex-row relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/3 -left-24 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-blue-400/10 rounded-full filter blur-3xl"></div>
        </div>
        
        {/* Auth Forms Column */}
        <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-4 sm:p-8 z-10 relative">
          <div className="w-full max-w-md relative">
            {/* Floating shapes/dots */}
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/5 rounded-full hidden lg:block"></div>
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-primary/5 rounded-full hidden lg:block"></div>
            
            {/* Logo/Branding */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg">
                <IconShieldLock className="h-8 w-8" stroke={2} />
              </div>
              <h2 className="mt-5 text-4xl font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                  SecureApp
                </span>
              </h2>
              <p className="mt-2 text-slate-600 text-lg">Powerful authentication system</p>
            </div>

            {/* Auth Card */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-none rounded-2xl">
              <CardContent className="pt-6">
                {authState === "login" || authState === "register" ? (
                  <Tabs 
                    defaultValue={authState} 
                    onValueChange={(value) => setAuthState(value as "login" | "register")}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-6 rounded-full p-1 bg-slate-100">
                      <TabsTrigger value="login" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Sign In</TabsTrigger>
                      <TabsTrigger value="register" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    {/* Login Form */}
                    <TabsContent value="login">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      placeholder="Enter your email" 
                                      className="pl-10 py-6 rounded-xl" 
                                      {...field} 
                                    />
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                  </div>
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type="password" 
                                      placeholder="Enter your password" 
                                      className="pl-10 py-6 rounded-xl" 
                                      {...field} 
                                    />
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex items-center justify-between">
                            <FormField
                              control={loginForm.control}
                              name="rememberMe"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value} 
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                                </FormItem>
                              )}
                            />
                            <Button
                              variant="link"
                              className="p-0 text-sm font-medium text-primary"
                              onClick={() => setAuthState("resetPassword")}
                              type="button"
                            >
                              Forgot password?
                            </Button>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full py-6 rounded-xl mt-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90" 
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                              </>
                            ) : (
                              "Sign In"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                    
                    {/* Register Form */}
                    <TabsContent value="register">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      placeholder="Enter your email" 
                                      className="pl-10 py-6 rounded-xl" 
                                      {...field} 
                                    />
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                  </div>
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type="password" 
                                      placeholder="Create a password" 
                                      className="pl-10 py-6 rounded-xl" 
                                      {...field} 
                                    />
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                  </div>
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
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type="password" 
                                      placeholder="Confirm your password" 
                                      className="pl-10 py-6 rounded-xl" 
                                      {...field} 
                                    />
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="terms"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange}
                                    className="mt-1"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-normal">
                                    I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
                                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full py-6 rounded-xl mt-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90" 
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account
                              </>
                            ) : (
                              "Create Account"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                ) : authState === "resetPassword" ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-medium text-slate-900 mb-2">Reset your password</h3>
                      <p className="text-sm text-gray-600">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>
                    
                    <Form {...resetPasswordForm}>
                      <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={resetPasswordForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder="Enter your email" 
                                    className="pl-10 py-6 rounded-xl" 
                                    {...field} 
                                  />
                                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full py-6 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90" 
                          disabled={resetPasswordMutation.isPending}
                        >
                          {resetPasswordMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending
                            </>
                          ) : (
                            "Send Reset Link"
                          )}
                        </Button>
                        
                        <Button
                          variant="link"
                          className="w-full text-primary"
                          onClick={() => setAuthState("login")}
                          type="button"
                        >
                          Back to Sign In
                        </Button>
                      </form>
                    </Form>
                  </div>
                ) : authState === "resetSuccess" ? (
                  <div className="py-6 text-center space-y-4">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Check your email</h3>
                    <p className="text-sm text-gray-600">
                      We've sent a password reset link to your email address. Please check your inbox.
                    </p>
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl py-6"
                        onClick={() => setAuthState("login")}
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  </div>
                ) : authState === "verifyEmail" ? (
                  <div className="py-6 text-center space-y-4">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Verify your email address</h3>
                    <p className="text-sm text-gray-600">
                      We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
                    </p>
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl py-6"
                        onClick={() => setAuthState("login")}
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center relative overflow-hidden">
          <BackgroundBeams />
          <div className="relative z-10 max-w-md mx-auto text-white">
            <div className="mb-10">
              <TypewriterEffect 
                words={[
                  { text: "Secure." },
                  { text: "Simple." },
                  { text: "Powerful." },
                ]}
                className="text-4xl font-bold mb-4"
              />
              <h1 className="text-4xl font-bold mb-6">Authentication Solution</h1>
              <p className="text-lg mb-8 text-white/90">
                Experience top-tier security with our Supabase-powered authentication system. Protect your data with industry-leading security practices.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Robust Security</h3>
                  <p className="text-white/80">Powered by Supabase Auth with industry-standard encryption and security practices.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Fast Integration</h3>
                  <p className="text-white/80">Easily integrate with your existing application or build from scratch.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Modern Framework</h3>
                  <p className="text-white/80">Built with React, TypeScript and other modern technologies.</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <div className="h-3 w-3 rounded-full bg-green-400 mr-2"></div>
                  <p className="text-sm font-medium">Active Protection</p>
                </div>
                <p className="text-sm text-white/70">
                  Your system is actively protected against common threats including brute force attacks, SQL injection, and XSS vulnerabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}