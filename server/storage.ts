import { 
  users, projects, files, deployments, 
  codeSnippets, gitRepositories, 
  collaborationSessions, cicdPipelines 
} from "@shared/schema";
import type { 
  User, InsertUser, Project, InsertProject, 
  File, InsertFile, Deployment, InsertDeployment,
  CodeSnippet, InsertCodeSnippet, GitRepository, InsertGitRepository,
  CollaborationSession, InsertCollaborationSession,
  CicdPipeline, InsertCicdPipeline
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFilesByProjectId(projectId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, file: Partial<File>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  
  // Deployment operations
  getDeployment(id: number): Promise<Deployment | undefined>;
  getDeploymentsByProjectId(projectId: number): Promise<Deployment[]>;
  getDeploymentsByUserId(userId: number): Promise<Deployment[]>;
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  updateDeployment(id: number, deployment: Partial<Deployment>): Promise<Deployment | undefined>;
  
  // Code Snippet operations (for one-click sharing with vanity URLs)
  getCodeSnippet(id: number): Promise<CodeSnippet | undefined>;
  getCodeSnippetByVanityUrl(vanityUrl: string): Promise<CodeSnippet | undefined>;
  getCodeSnippetsByUserId(userId: number): Promise<CodeSnippet[]>;
  createCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet>;
  updateCodeSnippet(id: number, snippet: Partial<CodeSnippet>): Promise<CodeSnippet | undefined>;
  deleteCodeSnippet(id: number): Promise<boolean>;
  incrementCodeSnippetViews(id: number): Promise<CodeSnippet | undefined>;
  
  // Git Repository operations
  getGitRepository(id: number): Promise<GitRepository | undefined>;
  getGitRepositoriesByProjectId(projectId: number): Promise<GitRepository[]>;
  getGitRepositoriesByUserId(userId: number): Promise<GitRepository[]>;
  createGitRepository(repo: InsertGitRepository): Promise<GitRepository>;
  updateGitRepository(id: number, repo: Partial<GitRepository>): Promise<GitRepository | undefined>;
  deleteGitRepository(id: number): Promise<boolean>;
  
  // Collaboration Session operations
  getCollaborationSession(id: number): Promise<CollaborationSession | undefined>;
  getCollaborationSessionByKey(sessionKey: string): Promise<CollaborationSession | undefined>;
  getCollaborationSessionsByUserId(userId: number): Promise<CollaborationSession[]>;
  createCollaborationSession(session: InsertCollaborationSession): Promise<CollaborationSession>;
  updateCollaborationSession(id: number, session: Partial<CollaborationSession>): Promise<CollaborationSession | undefined>;
  deleteCollaborationSession(id: number): Promise<boolean>;
  
  // CI/CD Pipeline operations
  getCicdPipeline(id: number): Promise<CicdPipeline | undefined>;
  getCicdPipelinesByProjectId(projectId: number): Promise<CicdPipeline[]>;
  getCicdPipelinesByUserId(userId: number): Promise<CicdPipeline[]>;
  createCicdPipeline(pipeline: InsertCicdPipeline): Promise<CicdPipeline>;
  updateCicdPipeline(id: number, pipeline: Partial<CicdPipeline>): Promise<CicdPipeline | undefined>;
  deleteCicdPipeline(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private files: Map<number, File>;
  private deployments: Map<number, Deployment>;
  
  private userIdCounter: number;
  private projectIdCounter: number;
  private fileIdCounter: number;
  private deploymentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.files = new Map();
    this.deployments = new Map();
    
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.fileIdCounter = 1;
    this.deploymentIdCounter = 1;
    
    // Add a demo user
    this.createUser({
      username: "demo",
      password: "password",
      email: "demo@example.com",
      fullName: "Demo User"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date().toISOString();
    
    const user: User = {
      ...insertUser,
      id,
      fullName: insertUser.fullName || null,
    };
    
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date().toISOString();
    
    const project: Project = {
      ...insertProject,
      id,
      description: insertProject.description || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    
    if (!project) return undefined;
    
    const updatedProject: Project = {
      ...project,
      ...projectUpdate,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // File methods
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByProjectId(projectId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.projectId === projectId
    );
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.fileIdCounter++;
    const now = new Date().toISOString();
    
    const file: File = {
      ...insertFile,
      id,
      content: insertFile.content || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: number, fileUpdate: Partial<File>): Promise<File | undefined> {
    const file = this.files.get(id);
    
    if (!file) return undefined;
    
    const updatedFile: File = {
      ...file,
      ...fileUpdate,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  // Deployment methods
  async getDeployment(id: number): Promise<Deployment | undefined> {
    return this.deployments.get(id);
  }

  async getDeploymentsByProjectId(projectId: number): Promise<Deployment[]> {
    return Array.from(this.deployments.values()).filter(
      (deployment) => deployment.projectId === projectId
    );
  }

  async getDeploymentsByUserId(userId: number): Promise<Deployment[]> {
    return Array.from(this.deployments.values()).filter(
      (deployment) => deployment.userId === userId
    );
  }

  async createDeployment(insertDeployment: InsertDeployment): Promise<Deployment> {
    const id = this.deploymentIdCounter++;
    const now = new Date().toISOString();
    
    const deployment: Deployment = {
      ...insertDeployment,
      id,
      resourceGroup: insertDeployment.resourceGroup || null,
      region: insertDeployment.region || null,
      serviceName: insertDeployment.serviceName || null,
      serviceType: insertDeployment.serviceType || null,
      deploymentUrl: null,
      deploymentDetails: {},
      createdAt: now,
      updatedAt: now
    };
    
    this.deployments.set(id, deployment);
    return deployment;
  }

  async updateDeployment(id: number, deploymentUpdate: Partial<Deployment>): Promise<Deployment | undefined> {
    const deployment = this.deployments.get(id);
    
    if (!deployment) return undefined;
    
    const updatedDeployment: Deployment = {
      ...deployment,
      ...deploymentUpdate,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.deployments.set(id, updatedDeployment);
    return updatedDeployment;
  }
}

// Create and export storage instance
export const storage = new MemStorage();
