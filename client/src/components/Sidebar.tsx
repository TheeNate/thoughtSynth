import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { 
  Plus, 
  Layers, 
  Clock, 
  Tags, 
  Search,
  Brain,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: "Add Content", href: "/", icon: Plus },
    { name: "All Content", href: "/content", icon: Layers },
    { name: "Recent", href: "/recent", icon: Clock },
    { name: "Categories", href: "/categories", icon: Tags },
    { name: "Search", href: "/search", icon: Search },
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-gradient-to-b from-card via-card to-muted/50 dark:from-card dark:via-card dark:to-muted/20 border-r border-border/50 dark:border-border/30 flex flex-col backdrop-blur-xl animate-slide-in-left relative`}>
      {/* Collapse Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 z-10 bg-background dark:bg-card border border-border/50 dark:border-border/30 rounded-full w-6 h-6 p-0 shadow-md hover:shadow-lg transition-all"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Header */}
      <div className={`${isCollapsed ? 'p-3' : 'p-6'} border-b border-border/50 dark:border-border/30 transition-all duration-300`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-2`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <h1 className="text-lg font-bold gradient-text">
                Knowledge Hub
              </h1>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                AI-Powered Platform
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'} space-y-2 transition-all duration-300`}>
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full ${isCollapsed ? 'justify-center p-2' : 'justify-start space-x-3'} group transition-all duration-300 animate-fade-in-up ${
                  isActive 
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1"
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 transition-colors ${
                  isActive ? "text-white" : "group-hover:text-foreground"
                }`} />
                {!isCollapsed && (
                  <span className="font-medium transition-opacity duration-300">{item.name}</span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-border/50 dark:border-border/30 bg-gradient-to-br from-muted/50 to-transparent transition-all duration-300`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                  {user?.firstName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground dark:text-white truncate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"
                  }
                </p>
                <p className="text-xs text-muted-foreground dark:text-gray-400 truncate">
                  {user?.email}
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground group transition-all duration-300"
              >
                <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group transition-all duration-300"
                onClick={() => window.location.href = '/api/logout'}
              >
                <LogOut className="h-4 w-4 group-hover:animate-pulse" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-8 w-8 border-2 border-primary/20" title={user?.firstName || "User"}>
              <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-xs">
                {user?.firstName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-muted-foreground hover:bg-muted/50 hover:text-foreground group transition-all duration-300"
              title="Settings"
            >
              <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group transition-all duration-300"
              onClick={() => window.location.href = '/api/logout'}
              title="Logout"
            >
              <LogOut className="h-4 w-4 group-hover:animate-pulse" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
