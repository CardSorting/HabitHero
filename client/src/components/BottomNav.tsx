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
  X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  priority: number; // Higher number = higher priority
}

const BottomNav: React.FC = () => {
  const [location] = useLocation();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [visibleItemCount, setVisibleItemCount] = useState(5);
  const [windowWidth, setWindowWidth] = useState(0);

  // Define all navigation items with priority
  const allNavItems: NavItem[] = [
    { icon: Home, label: "Today", path: "/today", priority: 100 },
    { icon: SmilePlus, label: "Emotions", path: "/emotions", priority: 90 },
    { icon: Calendar, label: "Calendar", path: "/calendar", priority: 80 },
    { icon: HeartHandshake, label: "Therapy", path: "/therapy", priority: 70 },
    { icon: BarChart2, label: "Progress", path: "/progress", priority: 60 },
    { icon: PieChart, label: "Analytics", path: "/analytics", priority: 50 },
    { icon: Settings, label: "Settings", path: "/settings", priority: 40 },
  ];

  // Determine number of visible items based on screen width
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      if (window.innerWidth < 360) {
        setVisibleItemCount(3); // Very small screens
      } else if (window.innerWidth < 480) {
        setVisibleItemCount(4); // Small mobile screens
      } else {
        setVisibleItemCount(5); // Larger screens
      }
    };

    // Initial call
    handleResize();
    
    // Add listener
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sort items by priority and split into visible and overflow
  const sortedNavItems = [...allNavItems].sort((a, b) => b.priority - a.priority);
  
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
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-1 z-10 shadow-lg"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-lg mx-auto px-1 sm:px-2">
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
                    className={`flex flex-col items-center py-1 px-1 sm:px-3 ${
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
                  <div className={`flex flex-col items-center py-1 px-1 sm:px-3 ${
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
      
      {/* More menu overlay */}
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
              className="absolute bottom-16 inset-x-0 bg-white rounded-t-xl shadow-lg py-4 px-4"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">More Options</h3>
                <button 
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {overflowItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <Link 
                      key={item.path} 
                      href={item.path}
                      onClick={() => setIsMoreMenuOpen(false)}
                    >
                      <div className={`flex flex-col items-center py-3 px-2 ${
                        isActive ? "text-primary bg-primary/10" : "text-gray-700 bg-gray-50"
                      } cursor-pointer rounded-lg`}>
                        <Icon className="mb-1" size={20} />
                        <span className={`text-xs ${isActive ? "font-medium" : ""}`}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomNav;
