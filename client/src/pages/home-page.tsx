import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, User, KeyRound, LogOut, Settings, Bell, CreditCard } from "lucide-react";
import { IconBrandSupabase, IconShieldLock } from "@tabler/icons-react";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Get initials for avatar
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <GradientBackground>
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                <IconShieldLock className="h-5 w-5" stroke={2.5} />
              </div>
              <h1 className="text-2xl font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                  SecureApp
                </span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hidden sm:flex"
              >
                <Settings className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3 border border-border rounded-full p-1 pl-3">
                <span className="text-sm font-medium hidden sm:inline-block">{user?.email}</span>
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.email ? getInitials(user.email) : "??"}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        
          <Card className="bg-white shadow-sm mb-8 border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Welcome back!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-6">
                You're now viewing a protected route that only authenticated users can access.
                Your session is secured with Supabase authentication.
              </p>
              
              <div className="flex gap-3 items-center bg-primary/5 p-3 rounded-lg border border-primary/20">
                <IconBrandSupabase className="h-10 w-10 text-primary" stroke={1.5} />
                <div>
                  <h3 className="font-medium">Powered by Supabase Auth</h3>
                  <p className="text-sm text-slate-600">Using industry-standard security practices for authentication</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-sm border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500 mb-1">Email Address</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500 mb-1">Account ID</span>
                    <span className="font-medium truncate">{user?.id}</span>
                  </div>
                  <div className="pt-2">
                    <Button className="w-full" variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm">Password strength</span>
                    <span className="text-sm font-medium text-green-600">Strong</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm">Two-factor auth</span>
                    <span className="text-sm font-medium text-amber-600">Not enabled</span>
                  </div>
                  <div className="pt-2">
                    <Button className="w-full" variant="outline" size="sm">
                      Manage Security
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm">Current plan</span>
                    <span className="text-sm font-medium">Free tier</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm">Renewal date</span>
                    <span className="text-sm font-medium">N/A</span>
                  </div>
                  <div className="pt-2">
                    <Button className="w-full" variant="default" size="sm">
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}