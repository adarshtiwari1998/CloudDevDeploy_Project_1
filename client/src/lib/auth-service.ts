import { 
  PublicClientApplication, 
  AuthenticationResult, 
  AccountInfo, 
  InteractionRequiredAuthError, 
  SilentRequest 
} from '@azure/msal-browser';
import { msalConfig, loginRequest, azureManagementScopes } from './auth-config';

// Create the MSAL Application instance
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL instance
msalInstance.initialize().catch(console.error);

/**
 * Authentication Service for Azure CloudIDE
 * Handles Microsoft Entra ID (Azure AD) authentication via MSAL
 */
export class AuthService {
  /**
   * Handles the redirect response from Microsoft authentication
   * Should be called when the application loads
   */
  public static async handleRedirectResponse(): Promise<void> {
    try {
      // Handle the redirect response
      const response = await msalInstance.handleRedirectPromise();

      // If response is null, user is not returning from auth redirect
      if (response !== null) {
        // Store the account
        msalInstance.setActiveAccount(response.account);
      }
    } catch (error) {
      console.error('Error handling authentication redirect:', error);
    }
  }

  /**
   * Initialize authentication - to be called on app start
   */
  public static initialize(): void {
    // Set active account if we have one in cache
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }
  }

  /**
   * Redirect to Microsoft login page
   */
  public static async login(): Promise<void> {
    try {
      await msalInstance.loginRedirect({
        ...loginRequest,
        redirectStartPage: window.location.href
      });
    } catch (error) {
      console.error('Login redirect error:', error);
      throw error;
    }
  }

  /**
   * Sign out the user
   */
  public static logout(): void {
    msalInstance.logoutRedirect();
  }

  /**
   * Get the currently logged in user
   */
  public static getAccount(): AccountInfo | null {
    return msalInstance.getActiveAccount();
  }

  /**
   * Check if a user is currently logged in
   */
  public static isLoggedIn(): boolean {
    return msalInstance.getActiveAccount() !== null;
  }

  /**
   * Get an access token for the requested scopes
   * Will use silent acquisition if possible, falls back to interactive if necessary
   */
  public static async getToken(request: SilentRequest = { scopes: loginRequest.scopes }): Promise<string | null> {
    try {
      // Try to get token silently first
      const account = msalInstance.getActiveAccount();
      if (!account) {
        throw new Error('No active account! User must sign in first.');
      }

      // Add account to the request
      const tokenRequest = {
        ...request,
        account
      };

      // Try silent token acquisition
      const response = await msalInstance.acquireTokenSilent(tokenRequest);
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Fallback to interactive method if silent fails (e.g., token expired)
        try {
          // Note: acquireTokenRedirect doesn't return a token - it redirects the browser
          msalInstance.acquireTokenRedirect(request);
          // We won't reach this point due to redirect
          return null;
        } catch (interactiveError) {
          console.error('Error acquiring token interactively:', interactiveError);
          return null;
        }
      } else {
        console.error('Error acquiring token silently:', error);
        return null;
      }
    }
  }

  /**
   * Get token for Azure Management API (for resource deployment)
   */
  public static async getAzureManagementToken(): Promise<string | null> {
    return await this.getToken({ scopes: azureManagementScopes.scopes });
  }

  /**
   * Get user profile information
   */
  public static getUserInfo(): {
    name: string | undefined;
    username: string | undefined;
    email: string | undefined;
  } {
    const account = msalInstance.getActiveAccount();

    return {
      name: account?.name,
      username: account?.username,
      email: account?.username // Email is typically username in Microsoft accounts
    };
  }
}

// Export the MSAL instance for use with msal-react
export default msalInstance;