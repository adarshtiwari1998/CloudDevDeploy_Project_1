
import React from "react";
import { MsalProvider } from "@azure/msal-react";
import msalInstance from "../lib/auth-service";

export const AzureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
};

export default AzureAuthProvider;
