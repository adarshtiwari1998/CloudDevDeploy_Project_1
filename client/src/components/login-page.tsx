import React from 'react';
import { AuthService } from '../lib/auth-service';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { SquareAsterisk } from 'lucide-react';

/**
 * Login page component with Azure Authentication
 */
export default function LoginPage() {
  const handleLogin = () => {
    AuthService.login();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 mb-2">
            <svg className="h-16 w-16 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.6 12a9.6 9.6 0 1 1-19.2 0 9.6 9.6 0 0 1 19.2 0zM12 2.4A9.6 9.6 0 0 0 4.8 17.25L17.25 4.8A9.56 9.56 0 0 0 12 2.4zm0 19.2a9.6 9.6 0 0 0 7.2-14.85L6.75 19.2A9.56 9.56 0 0 0 12 21.6z"/>
            </svg>
          </div>
          <CardTitle className="text-2xl">Azure CloudIDE</CardTitle>
          <CardDescription>
            The intelligent cloud development environment with Azure integration
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in to access your projects, deploy to Azure, and use AI coding tools.
            </p>
          </div>
          
          <Button 
            onClick={handleLogin} 
            className="w-full flex items-center justify-center gap-2"
          >
            <SquareAsterisk className="h-5 w-5" />
            Sign in with Microsoft
          </Button>
        </CardContent>
        
        <CardFooter className="text-center text-xs text-gray-500">
          <p>Secure login powered by Microsoft Entra ID</p>
        </CardFooter>
      </Card>
    </div>
  );
}