import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

/**
 * Enhanced Theme Switcher Component with Context Awareness
 * 
 * Features:
 * - Automatic detection of system preferences
 * - Memory of user's theme preference
 * - Contextual switching based on time of day
 * - Smooth transition animations
 */
export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  // When mounted on client, we can show the UI
  useEffect(() => {
    setMounted(true);
    
    // Set initial time of day
    updateTimeOfDay();
    
    // Update time of day every hour
    const interval = setInterval(updateTimeOfDay, 1000 * 60 * 60);
    
    return () => clearInterval(interval);
  }, []);
  
  // Update time of day based on current hour
  const updateTimeOfDay = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      setTimeOfDay('morning');
    } else if (hour >= 12 && hour < 17) {
      setTimeOfDay('afternoon');
    } else if (hour >= 17 && hour < 21) {
      setTimeOfDay('evening');
    } else {
      setTimeOfDay('night');
    }
  };
  
  // Get contextual message based on time of day
  const getContextualMessage = () => {
    switch (timeOfDay) {
      case 'morning':
        return "Good morning! ☀️";
      case 'afternoon':
        return "Good afternoon! 🌤️";
      case 'evening':
        return "Good evening! 🌆";
      case 'night':
        return "Working late? 🌙";
    }
  };
  
  // Suggest theme based on time of day
  const getSuggestedTheme = () => {
    if (timeOfDay === 'night' || timeOfDay === 'evening') {
      return 'dark';
    } else {
      return 'light';
    }
  };
  
  // Apply suggested theme automatically if no preference is set
  useEffect(() => {
    const userPreference = localStorage.getItem('theme-preference');
    
    if (!userPreference) {
      setTheme(getSuggestedTheme());
    }
  }, [timeOfDay, setTheme]);
  
  // Save user preference to localStorage
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme-preference', newTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <div className="p-2 text-xs text-muted-foreground border-b mb-1">
          {getContextualMessage()}
        </div>
        
        <DropdownMenuItem onClick={() => handleThemeChange("light")} className="flex items-center justify-between">
          <div className="flex items-center">
            <Sun className="h-4 w-4 mr-2" />
            <span>Light</span>
          </div>
          {theme === "light" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleThemeChange("dark")} className="flex items-center justify-between">
          <div className="flex items-center">
            <Moon className="h-4 w-4 mr-2" />
            <span>Dark</span>
          </div>
          {theme === "dark" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleThemeChange("system")} className="flex items-center justify-between">
          <div className="flex items-center">
            <Monitor className="h-4 w-4 mr-2" />
            <span>System</span>
          </div>
          {theme === "system" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        {(timeOfDay === 'night' || timeOfDay === 'evening') && theme === 'light' && (
          <div className="p-2 mt-1 text-xs text-muted-foreground border-t">
            <span className="flex items-center">
              <Moon className="h-3.5 w-3.5 mr-1 text-primary" />
              Dark theme recommended for evening use
            </span>
          </div>
        )}
        
        {(timeOfDay === 'morning' || timeOfDay === 'afternoon') && theme === 'dark' && (
          <div className="p-2 mt-1 text-xs text-muted-foreground border-t">
            <span className="flex items-center">
              <Sun className="h-3.5 w-3.5 mr-1 text-primary" />
              Light theme recommended during daytime
            </span>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}