import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import AzureDeploymentForm from '@/components/azure-deployment-form';
import { AzureDeploymentService, DeploymentResult } from '@/lib/azure-deployment-service';
import { AuthService } from '@/lib/auth-service';
import { toast } from '@/hooks/use-toast';

export default function AzureDeploymentPage() {
  const [activeTab, setActiveTab] = useState('deploy');
  const [deployments, setDeployments] = useState<DeploymentResult[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentResult | null>(null);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  // Check if user is logged in
  const isLoggedIn = AuthService.isLoggedIn();

  // Handle new deployment
  const handleDeploymentComplete = (deployment: DeploymentResult) => {
    setDeployments((prev) => [deployment, ...prev]);
    setSelectedDeployment(deployment);
    setActiveTab('deployments');
  };

  // Refresh deployment status
  const refreshDeploymentStatus = async (deploymentId: string) => {
    setIsRefreshingStatus(true);
    try {
      const updatedDeployment = await AzureDeploymentService.checkDeploymentStatus(deploymentId);
      
      // Update the deployment in the list
      setDeployments((prev) => 
        prev.map((d) => d.id === deploymentId ? updatedDeployment : d)
      );
      
      // Update selected deployment if it's the one being refreshed
      if (selectedDeployment && selectedDeployment.id === deploymentId) {
        setSelectedDeployment(updatedDeployment);
      }
      
      toast({
        title: 'Status updated',
        description: `Deployment status: ${updatedDeployment.status}`,
      });
    } catch (error) {
      console.error('Error refreshing deployment status:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to refresh deployment status',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  // Get deployment logs
  const getDeploymentLogs = async (deploymentId: string) => {
    setIsLoadingLogs(true);
    try {
      const logs = await AzureDeploymentService.getDeploymentLogs(deploymentId);
      setDeploymentLogs(logs);
    } catch (error) {
      console.error('Error fetching deployment logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch deployment logs',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Color for deployment status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'failed':
        return 'bg-red-500 hover:bg-red-600';
      case 'deploying':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Azure Deployment</h1>
      
      {!isLoggedIn ? (
        <Alert className="mb-6">
          <AlertTitle>Not logged in</AlertTitle>
          <AlertDescription>
            You need to be logged in with your Microsoft account to deploy to Azure.
            Please log in to continue.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="deploy">Deploy Application</TabsTrigger>
            <TabsTrigger value="deployments">Deployment History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deploy" className="space-y-4">
            <AzureDeploymentForm onDeploymentComplete={handleDeploymentComplete} />
          </TabsContent>
          
          <TabsContent value="deployments" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Deployments List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Recent Deployments</CardTitle>
                  <CardDescription>
                    Your recent Azure deployments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deployments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No deployments found
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {deployments.map((deployment) => (
                        <li 
                          key={deployment.id}
                          className={`p-3 rounded border hover:bg-muted cursor-pointer transition-colors ${
                            selectedDeployment?.id === deployment.id ? 'bg-muted border-primary' : ''
                          }`}
                          onClick={() => {
                            setSelectedDeployment(deployment);
                            if (deployment.status === 'deploying' || deployment.status === 'initializing') {
                              refreshDeploymentStatus(deployment.id);
                            }
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="truncate flex-1">
                              <p className="font-medium">{deployment.details.appName || 'Unknown App'}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                ID: {deployment.id.substring(0, 8)}...
                              </p>
                            </div>
                            <Badge className={getStatusColor(deployment.status)}>
                              {deployment.status}
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
              
              {/* Deployment Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Deployment Details</CardTitle>
                  <CardDescription>
                    Details and logs for the selected deployment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedDeployment ? (
                    <div className="text-center py-12 text-gray-500">
                      Select a deployment to view details
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{selectedDeployment.details.appName || 'Unknown App'}</h3>
                          <p className="text-sm text-muted-foreground">ID: {selectedDeployment.id}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => refreshDeploymentStatus(selectedDeployment.id)}
                            disabled={isRefreshingStatus}
                          >
                            {isRefreshingStatus ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            <span className="ml-1">Refresh</span>
                          </Button>
                          
                          {selectedDeployment.url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(selectedDeployment.url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View App
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <Badge className={getStatusColor(selectedDeployment.status)}>
                            {selectedDeployment.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Type</p>
                          <p>{selectedDeployment.details.deploymentType || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Resource Group</p>
                          <p>{selectedDeployment.details.resourceGroup || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Region</p>
                          <p>{selectedDeployment.details.region || 'Unknown'}</p>
                        </div>
                      </div>
                      
                      {selectedDeployment.error && (
                        <Alert variant="destructive">
                          <AlertTitle>Deployment Error</AlertTitle>
                          <AlertDescription>
                            {selectedDeployment.error}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <Separator />
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Deployment Logs</h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => getDeploymentLogs(selectedDeployment.id)}
                            disabled={isLoadingLogs}
                          >
                            {isLoadingLogs ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            <span className="ml-1">Refresh Logs</span>
                          </Button>
                        </div>
                        
                        <div className="bg-muted rounded p-4 h-80 overflow-y-auto font-mono text-sm">
                          {isLoadingLogs ? (
                            <div className="flex justify-center items-center h-full">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              <span>Loading logs...</span>
                            </div>
                          ) : deploymentLogs.length === 0 ? (
                            <div className="text-muted-foreground">No logs available yet</div>
                          ) : (
                            <pre className="whitespace-pre-wrap break-all">
                              {deploymentLogs.map((log, i) => (
                                <div key={i} className="py-1 border-b border-muted">
                                  {log}
                                </div>
                              ))}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}