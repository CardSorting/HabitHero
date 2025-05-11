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
import BottomNav from "@/components/BottomNav";
import { AnimatePresence } from "framer-motion";

function Router() {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <div className="max-w-lg mx-auto h-full min-h-screen bg-background flex flex-col relative pb-16">
        <Switch location={location} key={location}>
          <Route path="/" component={Today} />
          <Route path="/progress" component={Progress} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/diary-card" component={DiaryCard} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
        <BottomNav />
      </div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
