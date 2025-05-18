import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from './ui/select';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from '@/hooks/use-toast';
import { 
  GitBranch, Play, Clock, GitCommit, 
  FileCode, Server, Package, Globe,
  Pause, FileCog, RotateCcw, BarChart2,
  PlusCircle, Check, XCircle, AlertTriangle,
  Loader2, Settings, Layers, ChevronRight, 
  Rocket, Shield, Wrench, Code
} from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'canceled';
  lastRun: Date | null;
  branch: string;
  steps: PipelineStep[];
  triggers: {
    onPush: boolean;
    onPullRequest: boolean;
    scheduled: boolean;
    scheduledTime?: string;
  };
}

interface PipelineStep {
  id: string;
  name: string;
  type: 'build' | 'test' | 'deploy' | 'custom';
  status: 'waiting' | 'running' | 'success' | 'failed' | 'skipped';
  duration?: number; // in seconds
  command?: string;
  environment?: string;
  dependsOn?: string[];
}

interface PipelineRun {
  id: string;
  pipelineId: string;
  status: 'running' | 'success' | 'failed' | 'canceled';
  startTime: Date;
  endTime?: Date;
  triggeredBy: string;
  commit: {
    id: string;
    message: string;
  };
  steps: PipelineStepRun[];
}

interface PipelineStepRun {
  id: string;
  name: string;
  status: 'waiting' | 'running' | 'success' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  logs: string;
}

/**
 * Azure DevOps CI/CD Pipeline Management Component
 * 
 * This component enables creating, configuring, and monitoring
 * CI/CD pipelines with deep Azure DevOps integration.
 */
export default function AzureCICDPipeline() {
  const [activeTab, setActiveTab] = useState<'pipelines' | 'runs' | 'environments'>('pipelines');
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPipelineDialog, setShowNewPipelineDialog] = useState(false);
  
  // Fetch pipelines and runs on component mount
  useEffect(() => {
    fetchPipelines();
    fetchPipelineRuns();
  }, []);
  
  // Fetch pipelines from Azure DevOps
  const fetchPipelines = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would make an API call to Azure DevOps
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock pipelines for demonstration
      const mockPipelines: Pipeline[] = [
        {
          id: '1',
          name: 'Frontend CI/CD',
          description: 'Build, test, and deploy frontend application',
          status: 'success',
          lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          branch: 'main',
          steps: [
            {
              id: 's1',
              name: 'Install Dependencies',
              type: 'build',
              status: 'success',
              duration: 45,
              command: 'npm install',
            },
            {
              id: 's2',
              name: 'Lint',
              type: 'test',
              status: 'success',
              duration: 12,
              command: 'npm run lint',
              dependsOn: ['s1'],
            },
            {
              id: 's3',
              name: 'Build',
              type: 'build',
              status: 'success',
              duration: 78,
              command: 'npm run build',
              dependsOn: ['s1'],
            },
            {
              id: 's4',
              name: 'Test',
              type: 'test',
              status: 'success',
              duration: 34,
              command: 'npm test',
              dependsOn: ['s1'],
            },
            {
              id: 's5',
              name: 'Deploy to Azure Static Web Apps',
              type: 'deploy',
              status: 'success',
              duration: 120,
              environment: 'production',
              dependsOn: ['s3', 's4'],
            },
          ],
          triggers: {
            onPush: true,
            onPullRequest: true,
            scheduled: true,
            scheduledTime: '00:00 UTC',
          },
        },
        {
          id: '2',
          name: 'Backend API Pipeline',
          description: 'Build and test backend services',
          status: 'running',
          lastRun: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          branch: 'main',
          steps: [
            {
              id: 's1',
              name: 'Install Dependencies',
              type: 'build',
              status: 'success',
              duration: 35,
              command: 'npm install',
            },
            {
              id: 's2',
              name: 'Lint',
              type: 'test',
              status: 'success',
              duration: 8,
              command: 'npm run lint',
              dependsOn: ['s1'],
            },
            {
              id: 's3',
              name: 'Build',
              type: 'build',
              status: 'running',
              command: 'npm run build',
              dependsOn: ['s1'],
            },
            {
              id: 's4',
              name: 'Test',
              type: 'test',
              status: 'waiting',
              command: 'npm test',
              dependsOn: ['s1'],
            },
            {
              id: 's5',
              name: 'Deploy to Azure App Service',
              type: 'deploy',
              status: 'waiting',
              environment: 'staging',
              dependsOn: ['s3', 's4'],
            },
          ],
          triggers: {
            onPush: true,
            onPullRequest: false,
            scheduled: false,
          },
        },
        {
          id: '3',
          name: 'Database Migration Pipeline',
          description: 'Run database migrations and tests',
          status: 'failed',
          lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          branch: 'feature/new-schema',
          steps: [
            {
              id: 's1',
              name: 'Backup Database',
              type: 'custom',
              status: 'success',
              duration: 120,
              command: 'scripts/backup-db.sh',
            },
            {
              id: 's2',
              name: 'Run Migrations',
              type: 'custom',
              status: 'failed',
              duration: 45,
              command: 'npm run migrate',
              dependsOn: ['s1'],
            },
            {
              id: 's3',
              name: 'Seed Test Data',
              type: 'custom',
              status: 'skipped',
              dependsOn: ['s2'],
            },
            {
              id: 's4',
              name: 'Run Integration Tests',
              type: 'test',
              status: 'skipped',
              dependsOn: ['s3'],
            },
          ],
          triggers: {
            onPush: false,
            onPullRequest: true,
            scheduled: false,
          },
        },
      ];
      
      setPipelines(mockPipelines);
      if (mockPipelines.length > 0 && !selectedPipeline) {
        setSelectedPipeline(mockPipelines[0]);
      }
      
    } catch (error) {
      toast({
        title: "Failed to load pipelines",
        description: "Could not fetch CI/CD pipelines from Azure DevOps.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch pipeline runs from Azure DevOps
  const fetchPipelineRuns = async () => {
    try {
      // In a real app, this would make an API call to Azure DevOps
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock pipeline runs for demonstration
      const mockPipelineRuns: PipelineRun[] = [
        {
          id: 'run1',
          pipelineId: '1',
          status: 'success',
          startTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          endTime: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
          triggeredBy: 'Jane Developer',
          commit: {
            id: 'a1b2c3d',
            message: 'Add new features to frontend',
          },
          steps: [
            {
              id: 's1',
              name: 'Install Dependencies',
              status: 'success',
              startTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
              endTime: new Date(Date.now() - 1000 * 60 * 60 * 1.9),
              logs: 'Installing packages...\nPackages installed successfully.',
            },
            {
              id: 's2',
              name: 'Lint',
              status: 'success',
              startTime: new Date(Date.now() - 1000 * 60 * 60 * 1.9),
              endTime: new Date(Date.now() - 1000 * 60 * 60 * 1.85),
              logs: 'Running ESLint...\nNo linting errors found.',
            },
            {
              id: 's3',
              name: 'Build',
              status: 'success',
              startTime: new Date(Date.now() - 1000 * 60 * 60 * 1.85),
              endTime: new Date(Date.now() - 1000 * 60 * 60 * 1.7),
              logs: 'Building application...\nBuild completed successfully.',
            },
            {
              id: 's4',
              name: 'Test',
              status: 'success',
              startTime: new Date(Date.now() - 1000 * 60 * 60 * 1.85),
              endTime: new Date(Date.now() - 1000 * 60 * 60 * 1.75),
              logs: 'Running tests...\n47 tests passed, 0 failed.',
            },
            {
              id: 's5',
              name: 'Deploy to Azure Static Web Apps',
              status: 'success',
              startTime: new Date(Date.now() - 1000 * 60 * 60 * 1.7),
              endTime: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
              logs: 'Deploying to Azure Static Web Apps...\nDeployment successful. URL: https://example.com',
            },
          ],
        },
        {
          id: 'run2',
          pipelineId: '2',
          status: 'running',
          startTime: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          triggeredBy: 'John Coder',
          commit: {
            id: 'b2c3d4e',
            message: 'Optimize backend performance',
          },
          steps: [
            {
              id: 's1',
              name: 'Install Dependencies',
              status: 'success',
              startTime: new Date(Date.now() - 1000 * 60 * 15),
              endTime: new Date(Date.now() - 1000 * 60 * 12),
              logs: 'Installing packages...\nPackages installed successfully.',
            },
            {
              id: 's2',
              name: 'Lint',
              status: 'success',
              startTime: new Date(Date.now() - 1000 * 60 * 12),
              endTime: new Date(Date.now() - 1000 * 60 * 11),
              logs: 'Running ESLint...\nNo linting errors found.',
            },
            {
              id: 's3',
              name: 'Build',
              status: 'running',
              startTime: new Date(Date.now() - 1000 * 60 * 11),
              logs: 'Building application...\nCompiling TypeScript...',
            },
            {
              id: 's4',
              name: 'Test',
              status: 'waiting',
              logs: '',
            },
            {
              id: 's5',
              name: 'Deploy to Azure App Service',
              status: 'waiting',
              logs: '',
            },
          ],
        },
        {
          id: 'run3',
          pipelineId: '3',
          status: 'failed',
          startTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          endTime: new Date(Date.now() - 1000 * 60 * 60 * 23.5), // 23.5 hours ago
          triggeredBy: 'Alex Engineer',
          commit: {
            id: 'c3d4e5f',
            message: 'Update database schema for new features',
          },
          steps: [
            {
              id: 's1',
              name: 'Backup Database',
              status: 'success',
              startTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
              endTime: new Date(Date.now() - 1000 * 60 * 60 * 23.8),
              logs: 'Backing up database...\nBackup completed successfully.',
            },
            {
              id: 's2',
              name: 'Run Migrations',
              status: 'failed',
              startTime: new Date(Date.now() - 1000 * 60 * 60 * 23.8),
              endTime: new Date(Date.now() - 1000 * 60 * 60 * 23.5),
              logs: 'Running migrations...\nERROR: Migration failed - Foreign key constraint failed for table "users".',
            },
            {
              id: 's3',
              name: 'Seed Test Data',
              status: 'skipped',
              logs: '',
            },
            {
              id: 's4',
              name: 'Run Integration Tests',
              status: 'skipped',
              logs: '',
            },
          ],
        },
      ];
      
      setPipelineRuns(mockPipelineRuns);
      
    } catch (error) {
      toast({
        title: "Failed to load pipeline runs",
        description: "Could not fetch CI/CD pipeline runs from Azure DevOps.",
        variant: "destructive",
      });
    }
  };
  
  // Run a pipeline
  const runPipeline = (pipelineId: string) => {
    toast({
      title: "Pipeline started",
      description: "The CI/CD pipeline has been queued to run.",
    });
    
    // In a real app, this would make an API call to trigger the pipeline in Azure DevOps
    // For demo, we'll update the UI to show the pipeline as running
    setPipelines(prevPipelines => 
      prevPipelines.map(pipeline => 
        pipeline.id === pipelineId 
          ? { ...pipeline, status: 'running', lastRun: new Date() } 
          : pipeline
      )
    );
  };
  
  // Stop a running pipeline
  const stopPipeline = (pipelineId: string) => {
    toast({
      title: "Pipeline stopped",
      description: "The CI/CD pipeline has been canceled.",
    });
    
    // In a real app, this would make an API call to stop the pipeline in Azure DevOps
    // For demo, we'll update the UI to show the pipeline as canceled
    setPipelines(prevPipelines => 
      prevPipelines.map(pipeline => 
        pipeline.id === pipelineId 
          ? { ...pipeline, status: 'canceled' } 
          : pipeline
      )
    );
  };
  
  // Create a new pipeline
  const createPipeline = (pipelineData: any) => {
    // In a real app, this would make an API call to create a pipeline in Azure DevOps
    toast({
      title: "Pipeline created",
      description: "The new CI/CD pipeline has been created.",
    });
    
    setShowNewPipelineDialog(false);
    
    // Refresh the list of pipelines
    fetchPipelines();
  };
  
  // Format duration in seconds to a readable format
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  };
  
  // Format relative time (e.g., "2 hours ago")
  const getRelativeTime = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return "default";
      case 'running':
        return "secondary";
      case 'failed':
        return "destructive";
      case 'canceled':
        return "outline";
      default:
        return "secondary";
    }
  };
  
  // Get status icon
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'waiting':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'skipped':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Get step type icon
  const StepTypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'build':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'test':
        return <FileCog className="h-4 w-4 text-amber-500" />;
      case 'deploy':
        return <Rocket className="h-4 w-4 text-green-500" />;
      case 'custom':
        return <Wrench className="h-4 w-4 text-purple-500" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };
  
  // Render pipeline card
  const renderPipelineCard = (pipeline: Pipeline) => {
    return (
      <div
        key={pipeline.id}
        className={`p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors ${
          selectedPipeline?.id === pipeline.id ? 'border-primary bg-muted/50' : ''
        }`}
        onClick={() => setSelectedPipeline(pipeline)}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{pipeline.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{pipeline.description}</p>
          </div>
          
          <Badge variant={getStatusBadgeVariant(pipeline.status)}>
            <div className="flex items-center gap-1">
              <StatusIcon status={pipeline.status} />
              <span className="capitalize">{pipeline.status}</span>
            </div>
          </Badge>
        </div>
        
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <GitBranch className="h-3.5 w-3.5" />
            <span>{pipeline.branch}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Last run: {getRelativeTime(pipeline.lastRun)}</span>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          {pipeline.status === 'running' ? (
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                stopPipeline(pipeline.id);
              }}
            >
              <Pause className="h-4 w-4 mr-1" />
              Stop
            </Button>
          ) : (
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                runPipeline(pipeline.id);
              }}
            >
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
          )}
        </div>
      </div>
    );
  };
  
  // Render pipeline run card
  const renderPipelineRunCard = (run: PipelineRun) => {
    const pipeline = pipelines.find(p => p.id === run.pipelineId);
    
    return (
      <div
        key={run.id}
        className={`p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors ${
          selectedRun?.id === run.id ? 'border-primary bg-muted/50' : ''
        }`}
        onClick={() => setSelectedRun(run)}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{pipeline?.name || 'Unknown Pipeline'}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-mono">{run.commit.id.substring(0, 7)}</span>
              {' - '}
              <span className="line-clamp-1">{run.commit.message}</span>
            </p>
          </div>
          
          <Badge variant={getStatusBadgeVariant(run.status)}>
            <div className="flex items-center gap-1">
              <StatusIcon status={run.status} />
              <span className="capitalize">{run.status}</span>
            </div>
          </Badge>
        </div>
        
        {/* Steps progress */}
        <div className="flex items-center gap-1 mt-4 h-1.5">
          {run.steps.map((step, index) => (
            <div 
              key={step.id}
              className={`h-full flex-1 rounded-full ${
                step.status === 'success' ? 'bg-green-500' :
                step.status === 'running' ? 'bg-blue-500' :
                step.status === 'failed' ? 'bg-red-500' :
                step.status === 'skipped' ? 'bg-gray-300' :
                'bg-gray-200'
              }`}
            ></div>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{getRelativeTime(run.startTime)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <GitCommit className="h-3.5 w-3.5" />
            <span>Triggered by: {run.triggeredBy}</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Render steps detail
  const renderStepsDetail = (steps: PipelineStep[] | PipelineStepRun[]) => {
    return (
      <div className="space-y-2 mt-4">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className="flex flex-col border rounded-md overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 bg-muted">
              <div className="flex items-center gap-2">
                <StatusIcon status={step.status} />
                <span className="font-medium text-sm">{step.name}</span>
                {'type' in step && (
                  <Badge variant="outline" className="ml-2">
                    <div className="flex items-center gap-1">
                      <StepTypeIcon type={step.type} />
                      <span className="capitalize">{step.type}</span>
                    </div>
                  </Badge>
                )}
              </div>
              
              {'duration' in step && step.duration && (
                <div className="text-xs text-muted-foreground">
                  {formatDuration(step.duration)}
                </div>
              )}
              
              {'startTime' in step && step.startTime && (
                <div className="text-xs text-muted-foreground">
                  {step.endTime 
                    ? formatDuration(Math.floor((step.endTime.getTime() - step.startTime.getTime()) / 1000))
                    : 'Running...'}
                </div>
              )}
            </div>
            
            {'command' in step && step.command && (
              <div className="p-3 border-t bg-black text-white text-xs font-mono">
                $ {step.command}
              </div>
            )}
            
            {'logs' in step && step.logs && (
              <div className="p-3 border-t bg-black text-white text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                {step.logs}
              </div>
            )}
            
            {'environment' in step && step.environment && (
              <div className="p-3 border-t">
                <div className="flex items-center gap-2 text-xs">
                  <Server className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Environment: </span>
                  <Badge variant="outline">{step.environment}</Badge>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render new pipeline dialog
  const renderNewPipelineDialog = () => {
    const [pipelineForm, setPipelineForm] = useState({
      name: '',
      description: '',
      branch: 'main',
      triggers: {
        onPush: true,
        onPullRequest: false,
        scheduled: false,
      },
    });
    
    return (
      <Dialog open={showNewPipelineDialog} onOpenChange={setShowNewPipelineDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Pipeline</DialogTitle>
            <DialogDescription>
              Configure a new CI/CD pipeline for your project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Pipeline Name</Label>
              <Input
                id="name"
                value={pipelineForm.name}
                onChange={(e) => setPipelineForm({...pipelineForm, name: e.target.value})}
                placeholder="e.g., Frontend Build and Deploy"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={pipelineForm.description}
                onChange={(e) => setPipelineForm({...pipelineForm, description: e.target.value})}
                placeholder="What does this pipeline do?"
                className="resize-none"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source Repository</Label>
                <Select defaultValue="current">
                  <SelectTrigger>
                    <SelectValue placeholder="Select repository" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Repository</SelectItem>
                    <SelectItem value="other">Other Repository</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={pipelineForm.branch}
                  onChange={(e) => setPipelineForm({...pipelineForm, branch: e.target.value})}
                  placeholder="e.g., main"
                />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Triggers</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="onPush">On Push</Label>
                    <p className="text-xs text-muted-foreground">
                      Run pipeline when changes are pushed to the branch
                    </p>
                  </div>
                  <Switch
                    id="onPush"
                    checked={pipelineForm.triggers.onPush}
                    onCheckedChange={(checked) => 
                      setPipelineForm({
                        ...pipelineForm, 
                        triggers: {...pipelineForm.triggers, onPush: checked}
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="onPullRequest">On Pull Request</Label>
                    <p className="text-xs text-muted-foreground">
                      Run pipeline when a pull request is created or updated
                    </p>
                  </div>
                  <Switch
                    id="onPullRequest"
                    checked={pipelineForm.triggers.onPullRequest}
                    onCheckedChange={(checked) => 
                      setPipelineForm({
                        ...pipelineForm, 
                        triggers: {...pipelineForm.triggers, onPullRequest: checked}
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="scheduled">Scheduled</Label>
                    <p className="text-xs text-muted-foreground">
                      Run pipeline on a regular schedule
                    </p>
                  </div>
                  <Switch
                    id="scheduled"
                    checked={pipelineForm.triggers.scheduled}
                    onCheckedChange={(checked) => 
                      setPipelineForm({
                        ...pipelineForm, 
                        triggers: {...pipelineForm.triggers, scheduled: checked}
                      })
                    }
                  />
                </div>
                
                {pipelineForm.triggers.scheduled && (
                  <div className="pl-4 border-l-2 border-muted space-y-2">
                    <Label htmlFor="scheduledTime">Schedule Time</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily at midnight</SelectItem>
                        <SelectItem value="weekly">Weekly on Sunday</SelectItem>
                        <SelectItem value="custom">Custom schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Pipeline Configuration</h4>
              <Select defaultValue="default">
                <SelectTrigger>
                  <SelectValue placeholder="Select configuration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default template</SelectItem>
                  <SelectItem value="node">Node.js Application</SelectItem>
                  <SelectItem value="react">React Frontend</SelectItem>
                  <SelectItem value="custom">Custom configuration</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                This will determine the basic steps included in your pipeline
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewPipelineDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => createPipeline(pipelineForm)}
              disabled={!pipelineForm.name.trim()}
            >
              Create Pipeline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Azure DevOps CI/CD Pipelines
            </CardTitle>
            <CardDescription>
              Configure, manage, and monitor your continuous integration and deployment pipelines
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                fetchPipelines();
                fetchPipelineRuns();
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button onClick={() => setShowNewPipelineDialog(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Pipeline
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="pipelines" className="flex-1">
              <Layers className="h-4 w-4 mr-2" />
              Pipelines ({pipelines.length})
            </TabsTrigger>
            <TabsTrigger value="runs" className="flex-1">
              <BarChart2 className="h-4 w-4 mr-2" />
              Recent Runs ({pipelineRuns.length})
            </TabsTrigger>
            <TabsTrigger value="environments" className="flex-1">
              <Globe className="h-4 w-4 mr-2" />
              Environments
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="pipelines">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Pipelines List */}
                <div className="md:col-span-2 space-y-4">
                  {isLoading ? (
                    Array(3).fill(0).map((_, index) => (
                      <div key={index} className="animate-pulse p-4 border rounded-lg space-y-3">
                        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="flex justify-between mt-4">
                          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))
                  ) : pipelines.length > 0 ? (
                    pipelines.map(pipeline => renderPipelineCard(pipeline))
                  ) : (
                    <div className="text-center p-8 border rounded-lg">
                      <Layers className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <h3 className="font-medium">No pipelines found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create your first CI/CD pipeline to get started
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setShowNewPipelineDialog(true)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Pipeline
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Pipeline Details */}
                <div className="md:col-span-3 border rounded-lg overflow-hidden">
                  {selectedPipeline ? (
                    <>
                      <div className="p-4 bg-muted border-b">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{selectedPipeline.name}</h3>
                          <Badge variant={getStatusBadgeVariant(selectedPipeline.status)}>
                            <div className="flex items-center gap-1">
                              <StatusIcon status={selectedPipeline.status} />
                              <span className="capitalize">{selectedPipeline.status}</span>
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{selectedPipeline.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs">
                          <div className="flex items-center gap-1">
                            <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{selectedPipeline.branch}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Last run: {getRelativeTime(selectedPipeline.lastRun)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Triggers: </span>
                            {selectedPipeline.triggers.onPush && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">Push</Badge>
                            )}
                            {selectedPipeline.triggers.onPullRequest && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">PR</Badge>
                            )}
                            {selectedPipeline.triggers.scheduled && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">Scheduled</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 overflow-y-auto max-h-[500px]">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium">Pipeline Steps</h4>
                          
                          <div className="flex gap-2">
                            {selectedPipeline.status === 'running' ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => stopPipeline(selectedPipeline.id)}
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Stop
                              </Button>
                            ) : (
                              <Button 
                                size="sm"
                                onClick={() => runPipeline(selectedPipeline.id)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Run
                              </Button>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        
                        {renderStepsDetail(selectedPipeline.steps)}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      Select a pipeline to view details
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="runs">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Runs List */}
                <div className="md:col-span-2 space-y-4">
                  {isLoading ? (
                    Array(3).fill(0).map((_, index) => (
                      <div key={index} className="animate-pulse p-4 border rounded-lg space-y-3">
                        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="flex justify-between mt-4">
                          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))
                  ) : pipelineRuns.length > 0 ? (
                    pipelineRuns.map(run => renderPipelineRunCard(run))
                  ) : (
                    <div className="text-center p-8 border rounded-lg">
                      <BarChart2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <h3 className="font-medium">No pipeline runs found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Run a pipeline to see execution history
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Run Details */}
                <div className="md:col-span-3 border rounded-lg overflow-hidden">
                  {selectedRun ? (
                    <>
                      <div className="p-4 bg-muted border-b">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">
                              Run #{selectedRun.id.substring(3)} - {pipelines.find(p => p.id === selectedRun.pipelineId)?.name || 'Unknown Pipeline'}
                            </h3>
                            <div className="flex items-center gap-2 text-xs mt-1">
                              <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-mono">{selectedRun.commit.id.substring(0, 7)}</span>
                              <span className="text-muted-foreground line-clamp-1">{selectedRun.commit.message}</span>
                            </div>
                          </div>
                          
                          <Badge variant={getStatusBadgeVariant(selectedRun.status)}>
                            <div className="flex items-center gap-1">
                              <StatusIcon status={selectedRun.status} />
                              <span className="capitalize">{selectedRun.status}</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Started: {getRelativeTime(selectedRun.startTime)}</span>
                          </div>
                          
                          {selectedRun.endTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Duration: {formatDuration(Math.floor((selectedRun.endTime.getTime() - selectedRun.startTime.getTime()) / 1000))}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Triggered by: {selectedRun.triggeredBy}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 overflow-y-auto max-h-[500px]">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium">Run Details</h4>
                          
                          <div className="flex gap-2">
                            {selectedRun.status === 'running' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  toast({
                                    title: "Run canceled",
                                    description: "The pipeline run has been canceled.",
                                  });
                                }}
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                toast({
                                  title: "Logs downloaded",
                                  description: "Pipeline logs have been downloaded to your device.",
                                });
                              }}
                            >
                              <FileCode className="h-4 w-4 mr-1" />
                              Download Logs
                            </Button>
                          </div>
                        </div>
                        
                        {renderStepsDetail(selectedRun.steps)}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      Select a run to view details
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="environments">
              <div className="border rounded-lg p-6 text-center">
                <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Deployment Environments</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Configure deployment environments for your pipelines, including development, staging, and production.
                </p>
                <Button className="mt-4">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Environment
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <div className="text-sm text-muted-foreground">
          <a 
            href="https://dev.azure.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open in Azure DevOps</span>
          </a>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.open('https://docs.microsoft.com/en-us/azure/devops/pipelines/', '_blank');
          }}
        >
          View Documentation
        </Button>
      </CardFooter>
      
      {/* New Pipeline Dialog */}
      {renderNewPipelineDialog()}
    </Card>
  );
}