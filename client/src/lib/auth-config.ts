// Microsoft Authentication Library (MSAL) configuration
// This file contains the configuration settings for the MSAL library to connect with Microsoft Entra ID

import { Configuration, LogLevel } from "@azure/msal-browser";

// MSAL configuration parameters
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "enter_your_client_id_here", // App (client) ID from app registration in Azure portal
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || "common"}`, // "common" allows users from any Microsoft Entra ID organization or personal account
    redirectUri: window.location.origin, // Defaults to the application's host URL
  },
  cache: {
    cacheLocation: "sessionStorage", // Configures cache location - "sessionStorage" or "localStorage"
    storeAuthStateInCookie: false, // Set to true for Internet Explorer 11 compatibility
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
      logLevel: LogLevel.Verbose
    }
  }
};

// Add scopes here for Microsoft Graph API access
export const loginRequest = {
  scopes: [
    "User.Read", // Basic profile information
    "openid", 
    "profile", 
    "email",
    // Add additional scopes as needed for Azure resource management, e.g.:
    // "https://management.azure.com/user_impersonation" // For Azure Resource Management
  ],
};

// Add Azure Management API scopes for deploying resources
export const azureManagementScopes = {
  scopes: [
    "https://management.azure.com/user_impersonation" // Required for Azure resource management on user's behalf
  ]
};

// Add Azure DevOps API scopes for DevOps integration
export const azureDevOpsScopes = {
  scopes: [
    "499b84ac-1321-427f-aa17-267ca6975798/user_impersonation" // Azure DevOps API
  ]
};