import { AuthService } from './auth-service';
import { apiRequest } from './queryClient';

/**
 * Types for Azure DevOps integration
 */
export interface DevOpsProject {
  id: string;
  name: string;
  description?: string;
  url: string;
  state: string;
  revision: number;
  visibility: string;
  lastUpdateTime: string;
}

export interface DevOpsRepository {
  id: string;
  name: string;
  url: string;
  project: {
    id: string;
    name: string;
  };
  defaultBranch: string;
  size: number;
  remoteUrl: string;
}

export interface DevOpsPipeline {
  id: number;
  name: string;
  folder: string;
  revision: number;
  url: string;
}

export interface DevOpsBuild {
  id: number;
  buildNumber: string;
  status: string;
  result: string;
  queueTime: string;
  startTime?: string;
  finishTime?: string;
  url: string;
  definition: {
    id: number;
    name: string;
  };
  sourceBranch: string;
  sourceVersion: string;
}

export interface DevOpsPullRequest {
  pullRequestId: number;
  title: string;
  description?: string;
  status: string;
  createdBy: {
    displayName: string;
    id: string;
  };
  creationDate: string;
  sourceRefName: string;
  targetRefName: string;
  url: string;
}

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  deploymentTarget: string;
  yamlContent: string;
}

/**
 * Azure DevOps Service
 * Provides functionality for integrating with Azure DevOps
 */
export class AzureDevOpsService {
  /**
   * Get Azure DevOps organizations for the current user
   */
  public static async getOrganizations(): Promise<string[]> {
    try {
      // Get Azure DevOps token
      const token = await AuthService.getToken({ scopes: ['499b84ac-1321-427f-aa17-267ca6975798/user_impersonation'] });
      
      if (!token) {
        throw new Error('Failed to acquire Azure DevOps token. Please log in again.');
      }
      
      // Call backend API
      const response = await apiRequest('GET', '/api/azure-devops/organizations', {
        token
      });
      
      const result = await response.json();
      return result.organizations as string[];
    } catch (error) {
      console.error('Error fetching Azure DevOps organizations:', error);
      return [];
    }
  }
  
  /**
   * Get projects in an Azure DevOps organization
   */
  public static async getProjects(organization: string): Promise<DevOpsProject[]> {
    try {
      // Get Azure DevOps token
      const token = await AuthService.getToken({ scopes: ['499b84ac-1321-427f-aa17-267ca6975798/user_impersonation'] });
      
      if (!token) {
        throw new Error('Failed to acquire Azure DevOps token. Please log in again.');
      }
      
      // Call backend API
      const response = await apiRequest('GET', `/api/azure-devops/projects?organization=${organization}`, {
        token
      });
      
      const result = await response.json();
      return result.projects as DevOpsProject[];
    } catch (error) {
      console.error('Error fetching Azure DevOps projects:', error);
      return [];
    }
  }
  
  /**
   * Get repositories in an Azure DevOps project
   */
  public static async getRepositories(organization: string, project: string): Promise<DevOpsRepository[]> {
    try {
      // Get Azure DevOps token
      const token = await AuthService.getToken({ scopes: ['499b84ac-1321-427f-aa17-267ca6975798/user_impersonation'] });
      
      if (!token) {
        throw new Error('Failed to acquire Azure DevOps token. Please log in again.');
      }
      
      // Call backend API
      const response = await apiRequest('GET', `/api/azure-devops/repositories?organization=${organization}&project=${project}`, {
        token
      });
      
      const result = await response.json();
      return result.repositories as DevOpsRepository[];
    } catch (error) {
      console.error('Error fetching Azure DevOps repositories:', error);
      return [];
    }
  }
  
  /**
   * Link Azure DevOps repository to the current project
   */
  public static async linkRepository(
    organization: string, 
    project: string, 
    repositoryId: string,
    projectId: string
  ): Promise<boolean> {
    try {
      // Get Azure DevOps token
      const token = await AuthService.getToken({ scopes: ['499b84ac-1321-427f-aa17-267ca6975798/user_impersonation'] });
      
      if (!token) {
        throw new Error('Failed to acquire Azure DevOps token. Please log in again.');
      }
      
      // Call backend API
      const response = await apiRequest('POST', '/api/azure-devops/link-repository', {
        token,
        organization,
        project,
        repositoryId,
        projectId
      });
      
      const result = await response.json();
      return result.success as boolean;
    } catch (error) {
      console.error('Error linking Azure DevOps repository:', error);
      return false;
    }
  }
  
  /**
   * Get pipelines in an Azure DevOps project
   */
  public static async getPipelines(organization: string, project: string): Promise<DevOpsPipeline[]> {
    try {
      // Get Azure DevOps token
      const token = await AuthService.getToken({ scopes: ['499b84ac-1321-427f-aa17-267ca6975798/user_impersonation'] });
      
      if (!token) {
        throw new Error('Failed to acquire Azure DevOps token. Please log in again.');
      }
      
      // Call backend API
      const response = await apiRequest('GET', `/api/azure-devops/pipelines?organization=${organization}&project=${project}`, {
        token
      });
      
      const result = await response.json();
      return result.pipelines as DevOpsPipeline[];
    } catch (error) {
      console.error('Error fetching Azure DevOps pipelines:', error);
      return [];
    }
  }
  
  /**
   * Trigger a pipeline run
   */
  public static async triggerPipeline(
    organization: string, 
    project: string, 
    pipelineId: number,
    branch: string = 'main'
  ): Promise<number> {
    try {
      // Get Azure DevOps token
      const token = await AuthService.getToken({ scopes: ['499b84ac-1321-427f-aa17-267ca6975798/user_impersonation'] });
      
      if (!token) {
        throw new Error('Failed to acquire Azure DevOps token. Please log in again.');
      }
      
      // Call backend API
      const response = await apiRequest('POST', '/api/azure-devops/trigger-pipeline', {
        token,
        organization,
        project,
        pipelineId,
        branch
      });
      
      const result = await response.json();
      return result.buildId as number;
    } catch (error) {
      console.error('Error triggering Azure DevOps pipeline:', error);
      throw error;
    }
  }
  
  /**
   * Get builds for a pipeline
   */
  public static async getBuilds(
    organization: string, 
    project: string, 
    pipelineId?: number
  ): Promise<DevOpsBuild[]> {
    try {
      // Get Azure DevOps token
      const token = await AuthService.getToken({ scopes: ['499b84ac-1321-427f-aa17-267ca6975798/user_impersonation'] });
      
      if (!token) {
        throw new Error('Failed to acquire Azure DevOps token. Please log in again.');
      }
      
      // Call backend API
      let url = `/api/azure-devops/builds?organization=${organization}&project=${project}`;
      if (pipelineId) {
        url += `&pipelineId=${pipelineId}`;
      }
      
      const response = await apiRequest('GET', url, {
        token
      });
      
      const result = await response.json();
      return result.builds as DevOpsBuild[];
    } catch (error) {
      console.error('Error fetching Azure DevOps builds:', error);
      return [];
    }
  }
  
  /**
   * Get build logs
   */
  public static async getBuildLogs(
    organization: string, 
    project: string, 
    buildId: number
  ): Promise<string[]> {
    try {
      // Get Azure DevOps token
      const token = await AuthService.getToken({ scopes: ['499b84ac-1321-427f-aa17-267ca6975798/user_impersonation'] });
      
      if (!token) {
        throw new Error('Failed to acquire Azure DevOps token. Please log in again.');
      }
      
      // Call backend API
      const response = await apiRequest('GET', `/api/azure-devops/build-logs?organization=${organization}&project=${project}&buildId=${buildId}`, {
        token
      });
      
      const result = await response.json();
      return result.logs as string[];
    } catch (error) {
      console.error('Error fetching Azure DevOps build logs:', error);
      return [];
    }
  }
  
  /**
   * Create a pull request
   */
  public static async createPullRequest(
    organization: string,
    project: string,
    repositoryId: string,
    title: string,
    description: string,
    sourceBranch: string,
    targetBranch: string = 'main'
  ): Promise<DevOpsPullRequest | null> {
    try {
      // Get Azure DevOps token
      const token = await AuthService.getToken({ scopes: ['499b84ac-1321-427f-aa17-267ca6975798/user_impersonation'] });
      
      if (!token) {
        throw new Error('Failed to acquire Azure DevOps token. Please log in again.');
      }
      
      // Call backend API
      const response = await apiRequest('POST', '/api/azure-devops/pull-requests', {
        token,
        organization,
        project,
        repositoryId,
        title,
        description,
        sourceBranch,
        targetBranch
      });
      
      const result = await response.json();
      return result.pullRequest as DevOpsPullRequest;
    } catch (error) {
      console.error('Error creating Azure DevOps pull request:', error);
      return null;
    }
  }
  
  /**
   * Get pipeline templates
   */
  public static async getPipelineTemplates(): Promise<PipelineTemplate[]> {
    try {
      // Call backend API
      const response = await apiRequest('GET', '/api/azure-devops/pipeline-templates');
      
      const result = await response.json();
      return result.templates as PipelineTemplate[];
    } catch (error) {
      console.error('Error fetching Azure DevOps pipeline templates:', error);
      return [];
    }
  }
  
  /**
   * Create pipeline YAML file
   */
  public static async createPipelineYaml(
    templateId: string,
    parameters: Record<string, string>
  ): Promise<string> {
    try {
      // Call backend API
      const response = await apiRequest('POST', '/api/azure-devops/create-pipeline-yaml', {
        templateId,
        parameters
      });
      
      const result = await response.json();
      return result.yaml as string;
    } catch (error) {
      console.error('Error creating Azure DevOps pipeline YAML:', error);
      throw error;
    }
  }
}