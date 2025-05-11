import React from "react";
import { Link, useLocation } from "wouter";
import { Home, BarChart2, Calendar, PieChart, Settings, BookOpen, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

const BottomNav: React.FC = () => {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Today", path: "/today" },
    { icon: BarChart2, label: "Progress", path: "/progress" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: PieChart, label: "Analytics", path: "/analytics" },
    { icon: BookOpen, label: "Diary", path: "/diary-card" },
    { icon: HeartHandshake, label: "Therapy", path: "/therapy" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const getTabPosition = () => {
    const index = navItems.findIndex((item) => item.path === location);
    return index >= 0 ? index : 0;
  };

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 z-10"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-lg mx-auto px-6">
        <div className="flex justify-between items-center relative">
          <motion.div 
            className="tab-indicator absolute h-1 bg-primary rounded-full" 
            style={{ 
              width: `${100 / navItems.length}%`,
              bottom: "-8px"
            }}
            animate={{ 
              left: `${(getTabPosition() * 100) / navItems.length}%` 
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex flex-col items-center py-1 px-4 ${
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
  );
};

export default BottomNav;
