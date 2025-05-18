import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from './ui/select';
import { Badge } from './ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  GitBranch, GitCommit, GitFork, GitMerge, Github, 
  GitCompare, GitPullRequest, RefreshCw, CheckCircle, 
  AlertCircle, Clock, Plus, Trash2, Upload, Download, 
  Link, Settings, ExternalLink
} from 'lucide-react';

interface Commit {
  id: string;
  message: string;
  author: string;
  date: string;
  hash: string;
}

interface Branch {
  name: string;
  isActive: boolean;
  lastCommit: string;
  lastCommitDate: string;
}

interface Repository {
  id: number;
  name: string;
  url: string;
  provider: 'github' | 'gitlab' | 'azure_devops';
  branch: string;
  lastSynced?: string;
}

/**
 * Git Version Control Integration Component
 * 
 * This component provides Git repository management with visualization
 * of commits, branches, and repository status.
 */
export default function GitIntegration() {
  const [activeTab, setActiveTab] = useState<'history' | 'branches' | 'changes'>('history');
  const [isLoading, setIsLoading] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [activeRepo, setActiveRepo] = useState<Repository | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  
  // Load repositories on component mount
  useEffect(() => {
    loadRepositories();
  }, []);
  
  // Load repositories from API
  const loadRepositories = async () => {
    try {
      setIsLoading(true);
      
      // Simulation of API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data for demonstration
      const mockRepos: Repository[] = [
        {
          id: 1,
          name: 'cloud-ide-frontend',
          url: 'https://github.com/user/cloud-ide-frontend',
          provider: 'github',
          branch: 'main',
          lastSynced: '2023-05-15T14:30:00Z',
        },
        {
          id: 2,
          name: 'azure-integration-api',
          url: 'https://dev.azure.com/org/project/_git/azure-integration-api',
          provider: 'azure_devops',
          branch: 'develop',
          lastSynced: '2023-05-14T09:45:00Z',
        },
      ];
      
      setRepositories(mockRepos);
      
      // Set first repo as active if none selected
      if (mockRepos.length > 0 && !activeRepo) {
        setActiveRepo(mockRepos[0]);
        loadRepoData(mockRepos[0]);
      }
      
    } catch (error) {
      toast({
        title: "Failed to load repositories",
        description: "Could not retrieve your Git repositories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load repository data (commits, branches)
  const loadRepoData = async (repo: Repository) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock commits data
      const mockCommits: Commit[] = [
        {
          id: '1',
          message: 'Add collaborative editing feature',
          author: 'Jane Developer',
          date: '2023-05-15T10:30:00Z',
          hash: 'a1b2c3d4e5f6',
        },
        {
          id: '2',
          message: 'Fix animation timing issue in code generator',
          author: 'John Coder',
          date: '2023-05-14T15:45:00Z',
          hash: 'b2c3d4e5f6g7',
        },
        {
          id: '3',
          message: 'Update Azure authentication integration',
          author: 'Jane Developer',
          date: '2023-05-13T09:15:00Z',
          hash: 'c3d4e5f6g7h8',
        },
        {
          id: '4',
          message: 'Implement AI code assistant features',
          author: 'Alex Engineer',
          date: '2023-05-12T14:20:00Z',
          hash: 'd4e5f6g7h8i9',
        },
        {
          id: '5',
          message: 'Initial project setup with Vite and React',
          author: 'Jane Developer',
          date: '2023-05-10T11:00:00Z',
          hash: 'e5f6g7h8i9j0',
        },
      ];
      
      // Mock branches data
      const mockBranches: Branch[] = [
        {
          name: 'main',
          isActive: repo.branch === 'main',
          lastCommit: 'Add collaborative editing feature',
          lastCommitDate: '2023-05-15T10:30:00Z',
        },
        {
          name: 'develop',
          isActive: repo.branch === 'develop',
          lastCommit: 'Fix animation timing issue in code generator',
          lastCommitDate: '2023-05-14T15:45:00Z',
        },
        {
          name: 'feature/ai-assistant',
          isActive: repo.branch === 'feature/ai-assistant',
          lastCommit: 'Implement AI code assistant features',
          lastCommitDate: '2023-05-12T14:20:00Z',
        },
      ];
      
      // Simulate changed files
      const mockChangedFiles = [
        'client/src/components/animated-code-generation.tsx',
        'client/src/components/code-playground.tsx',
        'client/src/components/code-sharing.tsx',
        'shared/schema.ts',
      ];
      
      setCommits(mockCommits);
      setBranches(mockBranches);
      setChangedFiles(mockChangedFiles);
      
    } catch (error) {
      toast({
        title: "Failed to load repository data",
        description: "Could not retrieve commit history and branches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Change active repository
  const handleRepoChange = (repoId: string) => {
    const repo = repositories.find(r => r.id === parseInt(repoId));
    if (repo) {
      setActiveRepo(repo);
      loadRepoData(repo);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get relative time (e.g., "2 days ago")
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 30) {
      return formatDate(dateString);
    } else if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  };
  
  // Get icon for repository provider
  const getProviderIcon = (provider: Repository['provider']) => {
    switch (provider) {
      case 'github':
        return <Github className="h-4 w-4" />;
      case 'gitlab':
        return <GitFork className="h-4 w-4" />;
      case 'azure_devops':
        return <GitPullRequest className="h-4 w-4" />;
      default:
        return <GitBranch className="h-4 w-4" />;
    }
  };
  
  // Truncate commit hash
  const truncateHash = (hash: string) => {
    return hash.substring(0, 7);
  };
  
  // Handle commit click
  const handleCommitClick = (commit: Commit) => {
    // In a real app, this would open the commit details or diff view
    toast({
      title: "Viewing commit",
      description: `${truncateHash(commit.hash)}: ${commit.message}`,
    });
  };
  
  // Refresh repository data
  const refreshRepo = () => {
    if (activeRepo) {
      toast({
        title: "Refreshing repository",
        description: "Pulling latest changes from remote...",
      });
      
      loadRepoData(activeRepo);
    }
  };
  
  // Add new repository
  const addRepository = () => {
    // In a real app, this would open a modal for repository configuration
    toast({
      title: "Add Repository",
      description: "This would open a dialog to configure a new Git repository.",
    });
  };
  
  // Display commit history visualization
  const renderCommitHistory = () => {
    return (
      <div className="space-y-4 mt-4">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse flex p-4 space-x-4 bg-muted rounded-lg">
              <div className="h-10 w-10 rounded-full bg-gray-300"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-4">
            {commits.map((commit) => (
              <div
                key={commit.id}
                className="flex items-start p-4 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => handleCommitClick(commit)}
              >
                <div className="flex flex-col items-center mr-4">
                  <GitCommit className="h-6 w-6 text-primary" />
                  <div className="h-full w-px bg-muted-foreground/30 my-1"></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h4 className="font-medium text-sm line-clamp-1">{commit.message}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {truncateHash(commit.hash)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(commit.date)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    Committed by {commit.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Display branches visualization
  const renderBranches = () => {
    return (
      <div className="space-y-4 mt-4">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse flex p-4 space-x-4 bg-muted rounded-lg">
              <div className="h-10 w-10 rounded-full bg-gray-300"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-4">
            {branches.map((branch) => (
              <div
                key={branch.name}
                className="flex items-center p-4 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="mr-4">
                  <GitBranch className={`h-6 w-6 ${branch.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{branch.name}</h4>
                      {branch.isActive && (
                        <Badge className="text-xs">current</Badge>
                      )}
                    </div>
                    
                    <span className="text-xs text-muted-foreground">
                      Updated {getRelativeTime(branch.lastCommitDate)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    Last commit: {branch.lastCommit}
                  </p>
                </div>
                
                <div className="ml-4">
                  <Button size="sm" variant="outline" disabled={branch.isActive}>
                    Checkout
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="pt-4 flex justify-center">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create New Branch
          </Button>
        </div>
      </div>
    );
  };
  
  // Display changed files
  const renderChangedFiles = () => {
    return (
      <div className="space-y-4 mt-4">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse flex p-4 space-x-4 bg-muted rounded-lg">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))
        ) : (
          <>
            <div className="space-y-2">
              {changedFiles.length > 0 ? (
                changedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded-md"
                  >
                    <span className="text-sm truncate">{file}</span>
                    <Badge variant="outline" className="text-xs">Modified</Badge>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                  <h4 className="font-medium">No Changes</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Working directory is clean
                  </p>
                </div>
              )}
            </div>
            
            {changedFiles.length > 0 && (
              <div className="pt-4 flex justify-between">
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Discard Changes
                </Button>
                
                <Button size="sm">
                  <GitCommit className="h-4 w-4 mr-2" />
                  Commit Changes
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Git Version Control
            </CardTitle>
            <CardDescription>
              Manage your repositories and track changes to your codebase
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={refreshRepo}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button variant="outline" size="sm" onClick={addRepository}>
              <Plus className="h-4 w-4 mr-2" />
              Add Repository
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Repository Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <Select
              value={activeRepo?.id.toString()}
              onValueChange={handleRepoChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map(repo => (
                  <SelectItem key={repo.id} value={repo.id.toString()}>
                    <div className="flex items-center gap-2">
                      {getProviderIcon(repo.provider)}
                      <span>{repo.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {activeRepo && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {activeRepo.branch}
              </Badge>
              
              <a 
                href={activeRepo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                View Repository
              </a>
            </div>
          )}
        </div>
        
        {/* Git Tabs */}
        <Tabs 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'history' | 'branches' | 'changes')}
        >
          <TabsList className="w-full">
            <TabsTrigger value="history" className="flex-1">
              <GitCommit className="h-4 w-4 mr-2" />
              Commit History
            </TabsTrigger>
            <TabsTrigger value="branches" className="flex-1">
              <GitBranch className="h-4 w-4 mr-2" />
              Branches
            </TabsTrigger>
            <TabsTrigger value="changes" className="flex-1">
              <GitCompare className="h-4 w-4 mr-2" />
              Changes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            {renderCommitHistory()}
          </TabsContent>
          
          <TabsContent value="branches">
            {renderBranches()}
          </TabsContent>
          
          <TabsContent value="changes">
            {renderChangedFiles()}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 mr-1" />
          {activeRepo?.lastSynced ? (
            <span>Last synced: {getRelativeTime(activeRepo.lastSynced)}</span>
          ) : (
            <span>Never synced</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Pull
          </Button>
          
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            Push
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}