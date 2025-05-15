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
import ClientAuthPage from "@/pages/auth-page";
import TherapistAuthPage from "@/pages/therapist-auth-page";
import OnboardingPage from "@/pages/onboarding-page";
import LandingPage from "@/pages/LandingPage";
import PricingPage from "@/pages/pricing";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { CrisisTrackerPage } from "@/features/crisis-tracker";
import { TherapistDashboard, ClientDetails } from "@/features/therapist/presentation/pages";
import ClientTimeDetail from "@/features/therapist/presentation/pages/ClientTimeDetail";
import TreatmentPlans from "@/features/therapist/presentation/pages/TreatmentPlans";
import TreatmentPlanDetail from "@/features/therapist/presentation/pages/TreatmentPlanDetail";
import TreatmentPlanForm from "@/features/therapist/presentation/pages/TreatmentPlanForm";
import { TherapistProvider } from "@/features/therapist/presentation/hooks/useTherapistContext";

function Router() {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <ResponsiveLayout>
        <Switch location={location} key={location}>
          <Route path="/" component={LandingPage} />
          <Route path="/pricing" component={PricingPage} />
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
          <Route path="/auth" component={ClientAuthPage} />
          <Route path="/therapist-auth" component={TherapistAuthPage} />
          
          {/* Therapist routes with role protection */}
          <ProtectedRoute 
            path="/therapist" 
            component={(props) => (
              <TherapistProvider>
                <TherapistDashboard {...props} />
              </TherapistProvider>
            )}
            requiredRole="therapist"
          />
          <ProtectedRoute 
            path="/therapist/clients/:clientId" 
            component={(props) => (
              <TherapistProvider>
                <ClientDetails {...props} />
              </TherapistProvider>
            )}
            requiredRole="therapist"
          />
          <ProtectedRoute 
            path="/therapist/clients/:clientId/time/:periodId" 
            component={(props) => (
              <TherapistProvider>
                <ClientTimeDetail {...props} />
              </TherapistProvider>
            )}
            requiredRole="therapist"
          />
          <ProtectedRoute 
            path="/therapist/clients/:clientId/treatment-plans" 
            component={(props) => (
              <TherapistProvider>
                <TreatmentPlans {...props} />
              </TherapistProvider>
            )}
            requiredRole="therapist"
          />
          <ProtectedRoute 
            path="/therapist/clients/:clientId/treatment-plans/:planId" 
            component={(props) => (
              <TherapistProvider>
                <TreatmentPlanDetail {...props} />
              </TherapistProvider>
            )}
            requiredRole="therapist"
          />
          <ProtectedRoute 
            path="/therapist/clients/:clientId/treatment-plans/new" 
            component={(props) => (
              <TherapistProvider>
                <TreatmentPlanForm {...props} />
              </TherapistProvider>
            )}
            requiredRole="therapist"
          />
          <ProtectedRoute 
            path="/therapist/clients/:clientId/treatment-plans/:planId/edit" 
            component={(props) => (
              <TherapistProvider>
                <TreatmentPlanForm {...props} />
              </TherapistProvider>
            )}
            requiredRole="therapist"
          />
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
