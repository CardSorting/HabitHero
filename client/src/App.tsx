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
import EmotionTimeAnalysis from "@/pages/EmotionTimeAnalysis";
import WellnessChallenges from "@/pages/WellnessChallenges";
import WellnessChallengeDetails from "@/pages/WellnessChallengeDetails";
import WellnessChallengeCategory from "@/pages/WellnessChallengeCategory";
import AuthPage from "@/pages/auth-page";
import OnboardingPage from "@/pages/onboarding-page";
import LandingPage from "@/pages/LandingPage";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { CrisisTrackerPage } from "@/features/crisis-tracker";

function Router() {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <ResponsiveLayout>
        <Switch location={location} key={location}>
          <Route path="/" component={LandingPage} />
          <Route path="/onboarding" component={OnboardingPage} />
          <ProtectedRoute path="/today" component={Today} />
          <ProtectedRoute path="/progress" component={Progress} />
          <ProtectedRoute path="/calendar" component={Calendar} />
          <ProtectedRoute path="/analytics" component={Analytics} />
          <ProtectedRoute path="/diary-card" component={DiaryCard} />
          <ProtectedRoute path="/therapy" component={TherapyCompanion} />
          <ProtectedRoute path="/emotions" component={EmotionsTracker} />
          <ProtectedRoute path="/emotions/time-analysis/:timePeriod" component={EmotionTimeAnalysis} />
          <ProtectedRoute path="/crisis-tracker" component={(props) => {
            // Get the user id from auth context and pass to the CrisisTrackerPage
            const user = props.user || { id: 1 };
            return <CrisisTrackerPage userId={user.id} />;
          }} />
          <ProtectedRoute path="/wellness-challenges" component={WellnessChallenges} />
          <ProtectedRoute path="/wellness-challenges/categories/:category" component={WellnessChallengeCategory} />
          <ProtectedRoute path="/wellness-challenges/:id" component={WellnessChallengeDetails} />
          <ProtectedRoute path="/settings" component={Settings} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </ResponsiveLayout>
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
