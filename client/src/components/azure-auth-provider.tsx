
import React, { useEffect } from "react";
import { MsalProvider, useMsal } from "@azure/msal-react";
import msalInstance, { AuthService } from "../lib/auth-service";

// Authentication initialization component
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance } = useMsal();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await msalInstance.initialize();
        AuthService.initialize();
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
