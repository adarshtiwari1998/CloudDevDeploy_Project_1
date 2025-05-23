
import { SERVER_URL } from './config';

import { Configuration, LogLevel } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID as string,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: `${SERVER_URL}/login`,
    navigateToLoginRequestUrl: true,
    postLogoutRedirectUri: SERVER_URL,
  },
  system: {
    allowNativeBroker: false,
    loggerOptions: {
      logLevel: LogLevel.Verbose,
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
        }
      }
    }
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true
  }
};

export const loginRequest = {
  scopes: ["User.Read", "openid", "profile", "email"]
};

export const azureManagementScopes = {
  scopes: ["https://management.azure.com/user_impersonation"]
};

export const azureDevOpsScopes = {
  scopes: ["499b84ac-1321-427f-aa17-267ca6975798/user_impersonation"]
};