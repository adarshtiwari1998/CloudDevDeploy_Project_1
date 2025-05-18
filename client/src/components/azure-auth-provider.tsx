
import React, { useEffect } from "react";
import { MsalProvider, useMsal } from "@azure/msal-react";
import msalInstance, { AuthService } from "../lib/auth-service";

// Authentication initialization component
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance } = useMsal();

  useEffect(() => {
    // Initialize authentication and handle redirect response
    const initAuth = async () => {
      try {
        // Initialize the auth service first
        AuthService.initialize();
        
        // Then handle response from authentication redirect
        await AuthService.handleRedirectResponse();
      } catch (error) {
        console.error("Authentication initialization error:", error);
      }
    };

    initAuth();
  }, [instance]);

  return <>{children}</>;
};

// Main Azure Authentication Provider component
export const AzureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthInitializer>{children}</AuthInitializer>
    </MsalProvider>
  );
};

export default AzureAuthProvider;
