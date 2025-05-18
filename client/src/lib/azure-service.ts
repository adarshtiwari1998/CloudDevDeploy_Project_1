import { apiRequest } from "./queryClient";
import { toast } from "@/hooks/use-toast";

// Interface for Azure deployment options
interface DeploymentOptions {
  resourceGroup?: string;
  region?: string;
  serviceName?: string;
  deploymentType?: 'AppService' | 'StaticWebApp' | 'Container';
}

// Azure deployment function
export const deployToAzure = async (options: DeploymentOptions = {}) => {
  try {
    const response = await apiRequest('POST', '/api/azure/deploy', {
      ...options,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Deployment failed');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Azure deployment error:', error);
    throw error;
  }
};

// Azure authentication status check
export const checkAzureAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await apiRequest('GET', '/api/azure/auth-status', undefined);
    const data = await response.json();
    return data.isAuthenticated;
  } catch (error) {
    console.error('Error checking Azure auth status:', error);
    return false;
  }
};

// Azure login function
export const loginWithAzure = async (): Promise<void> => {
  try {
    // Open a popup window for authentication
    const width = 600;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    
    window.open(
      '/api/azure/login',
      'Azure Login',
      `width=${width},height=${height},top=${top},left=${left}`
    );
    
    // The authentication status will be checked by a polling mechanism
    // or by receiving a message from the popup window
    
    // For simplicity, we'll just show a toast
    toast({
      title: 'Azure Authentication',
      description: 'Please complete the authentication in the popup window.',
    });
    
  } catch (error) {
    console.error('Azure login error:', error);
    toast({
      title: 'Authentication Failed',
      description: error instanceof Error ? error.message : 'An error occurred during authentication',
      variant: 'destructive',
    });
  }
};

// Azure resource list function
export const getAzureResources = async (resourceType: string) => {
  try {
    const response = await apiRequest('GET', `/api/azure/resources?type=${resourceType}`, undefined);
    const data = await response.json();
    return data.resources;
  } catch (error) {
    console.error(`Error fetching Azure ${resourceType}:`, error);
    throw error;
  }
};

// Azure deployment status check
export const checkDeploymentStatus = async (deploymentId: string) => {
  try {
    const response = await apiRequest('GET', `/api/azure/deployments/${deploymentId}/status`, undefined);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking deployment status:', error);
    throw error;
  }
};
