import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  BarChart2, 
  Calendar, 
  PieChart, 
  Settings, 
  HeartHandshake, 
  SmilePlus,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  priority: number;
}

const SideNav: React.FC = () => {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    { icon: Home, label: "Today", path: "/today", priority: 100 },
    { icon: SmilePlus, label: "Emotions", path: "/emotions", priority: 90 },
    { icon: HeartHandshake, label: "Skills Coach", path: "/therapy", priority: 88 },
    { icon: Calendar, label: "Calendar", path: "/calendar", priority: 85 },
    { icon: Target, label: "Challenges", path: "/wellness-challenges", priority: 80 },
    { icon: BarChart2, label: "Progress", path: "/progress", priority: 60 },
    { icon: PieChart, label: "Analytics", path: "/analytics", priority: 50 },
    { icon: Settings, label: "Settings", path: "/settings", priority: 40 },
  ];

  return (
    <div className="h-full py-6 w-64 border-r border-border bg-background hidden lg:flex flex-col">
      <div className="px-4 mb-8">
        <h1 className="text-xl font-bold text-primary">MindfulTrack</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-foreground hover:bg-muted hover:text-primary"
                  )}>
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    
                    {isActive && (
                      <div className="w-1 h-5 bg-primary rounded-full ml-auto" />
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="px-4 mt-auto">
        <div className="p-4 rounded-lg bg-muted">
          <h3 className="font-medium text-sm">Need help?</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Access our help guides or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SideNav;