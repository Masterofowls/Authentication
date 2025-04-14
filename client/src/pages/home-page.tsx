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
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white shadow-sm">
                <IconShieldLock className="h-4 w-4 sm:h-5 sm:w-5" stroke={2.5} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">
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
                className="flex items-center gap-2 sm:px-4"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                size="sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        
          <Card className="bg-white shadow-sm mb-6 sm:mb-8 border-none rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl font-bold">Welcome back!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-5 sm:mb-6 text-sm sm:text-base">
                You're now viewing a protected route that only authenticated users can access.
                Your session is secured with Supabase authentication.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gradient-to-r from-primary/5 to-purple-500/5 p-4 rounded-lg border border-primary/10">
                <IconBrandSupabase className="h-8 w-8 sm:h-10 sm:w-10 text-primary" stroke={1.5} />
                <div>
                  <h3 className="font-medium text-sm sm:text-base">Powered by Supabase Auth</h3>
                  <p className="text-xs sm:text-sm text-slate-600">Using industry-standard security practices for authentication</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="bg-white shadow-sm border-none rounded-xl overflow-hidden">
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-sm sm:text-md flex items-center gap-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm text-slate-500 mb-1">Email Address</span>
                    <span className="text-sm sm:text-base font-medium">{user?.email}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm text-slate-500 mb-1">Account ID</span>
                    <span className="text-sm sm:text-base font-medium truncate">{user?.id}</span>
                  </div>
                  <div className="pt-2">
                    <Button className="w-full rounded-lg py-1.5" variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border-none rounded-xl overflow-hidden">
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-sm sm:text-md flex items-center gap-2">
                  <KeyRound className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs sm:text-sm">Password strength</span>
                    <span className="text-xs sm:text-sm font-medium text-green-600">Strong</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs sm:text-sm">Two-factor auth</span>
                    <span className="text-xs sm:text-sm font-medium text-amber-600">Not enabled</span>
                  </div>
                  <div className="pt-2">
                    <Button className="w-full rounded-lg py-1.5" variant="outline" size="sm">
                      Manage Security
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border-none rounded-xl overflow-hidden sm:col-span-2 md:col-span-1">
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-sm sm:text-md flex items-center gap-2">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs sm:text-sm">Current plan</span>
                    <span className="text-xs sm:text-sm font-medium">Free tier</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs sm:text-sm">Renewal date</span>
                    <span className="text-xs sm:text-sm font-medium">N/A</span>
                  </div>
                  <div className="pt-2">
                    <Button className="w-full rounded-lg py-1.5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90" size="sm">
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