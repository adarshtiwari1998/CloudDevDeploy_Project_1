import React from 'react';
import { AuthService } from '../lib/auth-service';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogOut, Settings, User, Cloud } from 'lucide-react';
import { useLocation } from 'wouter';

/**
 * User Profile Component
 * Displays user information and authentication options
 */
export default function UserProfile() {
  const [_, setLocation] = useLocation();
  
  // Get user info from auth service
  const userInfo = AuthService.getUserInfo();
  const initials = userInfo.name ? 
    userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
    'U';
  
  // Handle logout
  const handleLogout = () => {
    AuthService.logout();
  };
  
  // Navigate to profile settings
  const goToSettings = () => {
    setLocation('/settings');
  };
  
  // Navigate to Azure resources
  const goToAzureResources = () => {
    setLocation('/azure-resources');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={`https://avatars.dicebear.com/api/initials/${initials}.svg`} alt={userInfo.name || 'User'} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userInfo.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{userInfo.email || ''}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={goToSettings} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={goToAzureResources} className="cursor-pointer">
          <Cloud className="mr-2 h-4 w-4" />
          <span>Azure Resources</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={goToSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}