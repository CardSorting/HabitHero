import React from "react";
import { useLocation } from "wouter";
import BottomNav from "./BottomNav";
import SideNav from "./SideNav";
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  
  // For landing page, use a full-width layout with no constraints
  if (location === "/") {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }
  
  // For auth/onboarding screens, use a simple centered layout
  if (location === "/auth" || location === "/onboarding") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    );
  }
  
  // For regular screens, use the responsive layout
  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <SideNav />
      
      {/* Main content area */}
      <main className={cn(
        "flex-1 flex flex-col relative",
        // Add padding at the bottom for mobile bottom nav
        "pb-16 lg:pb-0"
      )}>
        {/* Content container with responsive width/padding */}
        <div className={cn(
          // Base styles
          "h-full w-full mx-auto",
          // Mobile: Full width with standard padding
          "px-4 py-4",
          // Tablet: Centered content with max width
          "md:max-w-2xl md:px-6 md:py-6",
          // Desktop: Appropriate width and padding
          "lg:max-w-4xl lg:px-8 lg:py-8",
          // Extra large screens: Limit width for better readability
          "xl:max-w-6xl"
        )}>
          {children}
        </div>
      </main>
      
      {/* Mobile bottom navigation - hidden on desktop */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default ResponsiveLayout;