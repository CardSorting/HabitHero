import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  BarChart2, 
  Calendar, 
  PieChart, 
  Settings, 
  HeartHandshake, 
  SmilePlus, 
  MoreHorizontal, 
  X,
  Target,
  Award,
  AlertCircle,
  ShieldCheck,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  priority: number; // Higher number = higher priority
  roleRequired?: "client" | "therapist" | "admin";
}

const BottomNav: React.FC = () => {
  const [location] = useLocation();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [visibleItemCount, setVisibleItemCount] = useState(5);
  const [windowWidth, setWindowWidth] = useState(0);
  const { user } = useAuth();

  // Define all navigation items with priority
  const allNavItems: NavItem[] = [
    { icon: Home, label: "Today", path: "/today", priority: 100 },
    { icon: SmilePlus, label: "Emotions", path: "/emotions", priority: 90 },
    { icon: HeartHandshake, label: "Skills Coach", path: "/therapy", priority: 88 },
    { icon: AlertCircle, label: "Crisis Tracker", path: "/crisis-tracker", priority: 87 },
    { icon: Brain, label: "DBT Cards", path: "/dbt-flashcards", priority: 86 },
    { icon: Calendar, label: "Calendar", path: "/calendar", priority: 85 },
    { icon: Target, label: "Challenges", path: "/wellness-challenges", priority: 80 },
    { icon: BarChart2, label: "Progress", path: "/progress", priority: 60 },
    { icon: PieChart, label: "Analytics", path: "/analytics", priority: 50 },
    { icon: ShieldCheck, label: "Therapist", path: "/therapist", priority: 95, roleRequired: "therapist" },
    { icon: Settings, label: "Settings", path: "/settings", priority: 40 },
  ];

  // Determine number of visible items based on screen width
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      if (window.innerWidth < 340) {
        setVisibleItemCount(3); // Very small screens
      } else if (window.innerWidth < 420) {
        setVisibleItemCount(4); // Small mobile screens
      } else if (window.innerWidth < 600) {
        setVisibleItemCount(5); // Medium screens
      } else {
        setVisibleItemCount(6); // Larger screens
      }
    };

    // Initial call
    handleResize();
    
    // Add listener
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter items based on user role and then sort by priority
  const filteredNavItems = allNavItems.filter(item => 
    !item.roleRequired || 
    item.roleRequired === user?.role || 
    user?.role === 'admin'
  );
  
  // Sort items by priority and split into visible and overflow
  const sortedNavItems = [...filteredNavItems].sort((a, b) => b.priority - a.priority);
  
  // Check if current page is in visible items, if not make it visible
  const currentPageIndex = sortedNavItems.findIndex(item => item.path === location);
  let visibleItems = sortedNavItems.slice(0, visibleItemCount);
  let overflowItems = sortedNavItems.slice(visibleItemCount);
  
  // If current page would be in overflow, swap it with the last visible item
  if (currentPageIndex >= visibleItemCount) {
    const currentPage = sortedNavItems[currentPageIndex];
    overflowItems = overflowItems.filter(item => item.path !== currentPage.path);
    const lastVisibleItem = visibleItems[visibleItemCount - 1];
    visibleItems = [...visibleItems.slice(0, visibleItemCount - 1), currentPage];
    overflowItems = [lastVisibleItem, ...overflowItems];
  }

  // Get active tab position for indicator
  const getTabPosition = () => {
    const index = visibleItems.findIndex((item) => item.path === location);
    
    if (index >= 0) {
      return index;
    } else if (overflowItems.some(item => item.path === location)) {
      return visibleItemCount - 1; // Position indicator under "More" button
    }
    
    return 0; // Default to first tab
  };

  return (
    <>
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-1 z-10 shadow-lg lg:hidden"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-lg mx-auto px-0.5 sm:px-1">
          <div className="flex justify-between items-center relative">
            {/* Active indicator */}
            <motion.div 
              className="tab-indicator absolute h-1 bg-primary rounded-full" 
              style={{ 
                width: `${100 / visibleItems.length}%`,
                bottom: "-1px"
              }}
              animate={{ 
                left: `${(getTabPosition() * 100) / visibleItems.length}%` 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            
            {/* Visible navigation items */}
            {visibleItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              const isMoreButton = index === visibleItems.length - 1 && overflowItems.length > 0;
              
              // If this is the more button and there are overflow items
              if (isMoreButton && overflowItems.length > 0) {
                return (
                  <button
                    key="more-button"
                    onClick={() => setIsMoreMenuOpen(true)}
                    className={`flex flex-col items-center py-1 px-0 sm:px-1 ${
                      overflowItems.some(item => item.path === location) ? "text-primary" : "text-muted-foreground"
                    } cursor-pointer focus:outline-none`}
                  >
                    <MoreHorizontal className="text-xl" size={20} />
                    <span className={`text-xs mt-1 ${overflowItems.some(item => item.path === location) ? "font-medium" : ""}`}>
                      More
                    </span>
                  </button>
                );
              }
              
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`flex flex-col items-center py-1 px-0 sm:px-1 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  } cursor-pointer`}>
                    <Icon className="text-xl" size={20} />
                    <span className={`text-xs mt-1 ${isActive ? "font-medium" : ""}`}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>
      
      {/* Slide-out menu */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMoreMenuOpen(false)}
          >
            <motion.div 
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-xl shadow-lg py-6 px-4 z-30"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-medium text-lg">Menu</h3>
                <button 
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Draggable handle */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full"></div>
              
              {/* All navigation items */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <Link 
                      key={item.path} 
                      href={item.path}
                      onClick={() => setIsMoreMenuOpen(false)}
                    >
                      <div className={`flex flex-col items-center justify-center py-4 px-2 ${
                        isActive ? "text-primary bg-primary/10 border-primary" : "text-gray-700 bg-gray-50 border-transparent"
                      } cursor-pointer rounded-xl border shadow-sm`}>
                        <Icon size={22} strokeWidth={2} className={`mb-2 ${isActive ? "text-primary" : ""}`} />
                        <span className={`text-sm ${isActive ? "font-medium" : ""}`}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              {/* Additional items could be added here */}
              <div className="w-full h-16 mt-6">
                {/* Spacer to ensure content doesn't get hidden behind bottom nav */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomNav;
