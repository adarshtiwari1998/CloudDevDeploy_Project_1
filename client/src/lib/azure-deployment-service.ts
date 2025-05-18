import { AuthService } from './auth-service';
import { apiRequest } from './queryClient';

/**
 * Types for Azure Deployment
 */

export interface DeploymentOptions {
  subscriptionId: string;
  resourceGroup: string;
  region: string;
  appName: string;
  deploymentType: 'AppService' | 'StaticWebApp' | 'Container';
  runtimeStack?: string;
  appSettings?: Record<string, string>;
  projectPath?: string;
}

export interface DeploymentResult {
  id: string;
  status: 'initializing' | 'deploying' | 'completed' | 'failed';
  url?: string;
  details: Record<string, any>;
  error?: string;
}

export interface AzureResource {
  id: string;
  name: string;
  type: string;
  location: string;
  properties: Record<string, any>;
}

/**
 * Azure Deployment Service
 * Handles deploying applications to Azure services
 */
export class AzureDeploymentService {
  /**
   * Deploy an application to Azure App Service
   */
  public static async deployToAppService(options: DeploymentOptions): Promise<DeploymentResult> {
    try {
      // Get Azure management token
      const token = await AuthService.getAzureManagementToken();
      
      if (!token) {
        throw new Error('Failed to acquire Azure Management token. Please log in again.');
      }
      
      // Call backend deployment API
      const response = await apiRequest('POST', '/api/azure/deploy', {
        ...options,
        token
      });
      
      const result = await response.json();
      return result as DeploymentResult;
    } catch (error) {
      console.error('Error deploying to Azure App Service:', error);
      return {
        id: '',
        status: 'failed',
        details: {},
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Deploy an application to Azure Static Web App
   */
  public static async deployToStaticWebApp(options: DeploymentOptions): Promise<DeploymentResult> {
    try {
      // Get Azure management token
      const token = await AuthService.getAzureManagementToken();
      
      if (!token) {
        throw new Error('Failed to acquire Azure Management token. Please log in again.');
      }
      
      // Override deployment type to ensure it's a Static Web App
      options.deploymentType = 'StaticWebApp';
      
      // Call backend deployment API
      const response = await apiRequest('POST', '/api/azure/deploy', {
        ...options,
        token
      });
      
      const result = await response.json();
      return result as DeploymentResult;
    } catch (error) {
      console.error('Error deploying to Azure Static Web App:', error);
      return {
        id: '',
        status: 'failed',
        details: {},
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Deploy an application to Azure Container Apps
   */
  public static async deployToContainerApps(options: DeploymentOptions): Promise<DeploymentResult> {
    try {
      // Get Azure management token
      const token = await AuthService.getAzureManagementToken();
      
      if (!token) {
        throw new Error('Failed to acquire Azure Management token. Please log in again.');
      }
      
      // Override deployment type to ensure it's a Container
      options.deploymentType = 'Container';
      
      // Call backend deployment API
      const response = await apiRequest('POST', '/api/azure/deploy', {
        ...options,
        token
      });
      
      const result = await response.json();
      return result as DeploymentResult;
    } catch (error) {
      console.error('Error deploying to Azure Container Apps:', error);
      return {
        id: '',
        status: 'failed',
        details: {},
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Get Azure subscriptions for the authenticated user
   */
  public static async getSubscriptions(): Promise<AzureResource[]> {
    try {
      // Get Azure management token
      const token = await AuthService.getAzureManagementToken();
      
      if (!token) {
        throw new Error('Failed to acquire Azure Management token. Please log in again.');
      }
      
      // Call backend API to get subscriptions
      const response = await apiRequest('GET', '/api/azure/resources?type=subscriptions', {
        token
      });
      
      const result = await response.json();
      return result.resources as AzureResource[];
    } catch (error) {
      console.error('Error fetching Azure subscriptions:', error);
      return [];
    }
  }
  
  /**
   * Get resource groups in a subscription
   */
  public static async getResourceGroups(subscriptionId: string): Promise<AzureResource[]> {
    try {
      // Get Azure management token
      const token = await AuthService.getAzureManagementToken();
      
      if (!token) {
        throw new Error('Failed to acquire Azure Management token. Please log in again.');
      }
      
      // Call backend API to get resource groups
      const response = await apiRequest('GET', `/api/azure/resources?type=resourceGroups&subscriptionId=${subscriptionId}`, {
        token
      });
      
      const result = await response.json();
      return result.resources as AzureResource[];
    } catch (error) {
      console.error('Error fetching Azure resource groups:', error);
      return [];
    }
  }
  
  /**
   * Check deployment status
   */
  public static async checkDeploymentStatus(deploymentId: string): Promise<DeploymentResult> {
    try {
      // Get Azure management token
      const token = await AuthService.getAzureManagementToken();
      
      if (!token) {
        throw new Error('Failed to acquire Azure Management token. Please log in again.');
      }
      
      // Call backend API to check deployment status
      const response = await apiRequest('GET', `/api/azure/deployments/${deploymentId}`, {
        token
      });
      
      const result = await response.json();
      return result as DeploymentResult;
    } catch (error) {
      console.error('Error checking deployment status:', error);
      return {
        id: deploymentId,
        status: 'failed',
        details: {},
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Get deployment logs
   */
  public static async getDeploymentLogs(deploymentId: string): Promise<string[]> {
    try {
      // Get Azure management token
      const token = await AuthService.getAzureManagementToken();
      
      if (!token) {
        throw new Error('Failed to acquire Azure Management token. Please log in again.');
      }
      
      // Call backend API to get deployment logs
      const response = await apiRequest('GET', `/api/azure/deployments/${deploymentId}/logs`, {
        token
      });
      
      const result = await response.json();
      return result.logs as string[];
    } catch (error) {
      console.error('Error fetching deployment logs:', error);
      return [];
    }
  }
  
  /**
   * Create a new resource group
   */
  public static async createResourceGroup(subscriptionId: string, name: string, location: string): Promise<AzureResource | null> {
    try {
      // Get Azure management token
      const token = await AuthService.getAzureManagementToken();
      
      if (!token) {
        throw new Error('Failed to acquire Azure Management token. Please log in again.');
      }
      
      // Call backend API to create resource group
      const response = await apiRequest('POST', '/api/azure/resources', {
        token,
        type: 'resourceGroup',
        subscriptionId,
        name,
        location
      });
      
      const result = await response.json();
      return result.resource as AzureResource;
    } catch (error) {
      console.error('Error creating resource group:', error);
      return null;
    }
  }
}