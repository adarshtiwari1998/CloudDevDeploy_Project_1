import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { 
  UploadCloud, 
  Sun, 
  Moon, 
  FilePlus, 
  Edit, 
  Eye, 
  Terminal as TerminalIcon, 
  Play, 
  Cloud,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDispatch } from "react-redux";
import { deployToAzure } from "@/lib/azure-service";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleDeploy = async () => {
    try {
      await deployToAzure();
      toast({
        title: "Deployment initiated",
        description: "Your application is being deployed to Azure.",
      });
    } catch (error) {
      toast({
        title: "Deployment failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="h-12 flex items-center px-4 justify-between bg-background border-b border-border">
      <div className="flex items-center">
        <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.6 12a9.6 9.6 0 1 1-19.2 0 9.6 9.6 0 0 1 19.2 0zM12 2.4A9.6 9.6 0 0 0 4.8 17.25L17.25 4.8A9.56 9.56 0 0 0 12 2.4zm0 19.2a9.6 9.6 0 0 0 7.2-14.85L6.75 19.2A9.56 9.56 0 0 0 12 21.6z"/>
        </svg>
        <span className="ml-2 text-lg font-semibold">Azure CloudIDE</span>
        
        <div className="ml-8 flex space-x-1">
          <Button variant="ghost" size="sm" className="px-3 py-1 text-sm rounded hover:bg-muted">
            <FilePlus className="h-4 w-4 mr-1" />
            File
          </Button>
          <Button variant="ghost" size="sm" className="px-3 py-1 text-sm rounded hover:bg-muted">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="px-3 py-1 text-sm rounded hover:bg-muted">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="ghost" size="sm" className="px-3 py-1 text-sm rounded hover:bg-muted">
            <TerminalIcon className="h-4 w-4 mr-1" />
            Terminal
          </Button>
          <Button variant="ghost" size="sm" className="px-3 py-1 text-sm rounded hover:bg-muted">
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
          <Link href="/azure-deployment">
            <Button variant="ghost" size="sm" className="px-3 py-1 text-sm rounded hover:bg-muted">
              <Cloud className="h-4 w-4 mr-1" />
              Azure
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="px-3 py-1 text-sm rounded hover:bg-muted">
            <HelpCircle className="h-4 w-4 mr-1" />
            Help
          </Button>
          <Link href="/ai-assistant">
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-3 py-1 text-sm rounded hover:bg-primary hover:text-primary-foreground"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              AI Assistant
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          onClick={handleDeploy}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded px-3 py-1 text-sm flex items-center"
        >
          <UploadCloud className="h-4 w-4 mr-1" />
          Deploy to Azure
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleTheme}
          className="p-1 rounded-full hover:bg-muted"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
