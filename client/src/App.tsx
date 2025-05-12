import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Today from "@/pages/Today";
import Progress from "@/pages/Progress";
import Calendar from "@/pages/Calendar";
import Settings from "@/pages/Settings";
import Analytics from "@/pages/Analytics";
import DiaryCard from "@/pages/DiaryCard";
import TherapyCompanion from "@/pages/TherapyCompanion";
import EmotionsTracker from "@/pages/EmotionsTracker";
import AuthPage from "@/pages/auth-page";
import OnboardingPage from "@/pages/onboarding-page";
import BottomNav from "@/components/BottomNav";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <div className="max-w-lg mx-auto h-full min-h-screen bg-background flex flex-col relative pb-16">
        <Switch location={location} key={location}>
          <Route path="/" component={OnboardingPage} />
          <ProtectedRoute path="/today" component={Today} />
          <ProtectedRoute path="/progress" component={Progress} />
          <ProtectedRoute path="/calendar" component={Calendar} />
          <ProtectedRoute path="/analytics" component={Analytics} />
          <ProtectedRoute path="/diary-card" component={DiaryCard} />
          <ProtectedRoute path="/therapy" component={TherapyCompanion} />
          <ProtectedRoute path="/emotions" component={EmotionsTracker} />
          <ProtectedRoute path="/settings" component={Settings} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
        {location !== "/auth" && location !== "/" && <BottomNav />}
      </div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
