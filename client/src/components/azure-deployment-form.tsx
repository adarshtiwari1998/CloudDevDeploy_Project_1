import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, Server, Globe, Package } from 'lucide-react';
import { AzureDeploymentService, DeploymentOptions, DeploymentResult, AzureResource } from '@/lib/azure-deployment-service';

// Form schema validation
const deploymentFormSchema = z.object({
  subscriptionId: z.string().min(1, { message: 'Please select an Azure subscription' }),
  resourceGroup: z.string().min(1, { message: 'Please select or create a resource group' }),
  region: z.string().min(1, { message: 'Please select a region' }),
  appName: z.string().min(3, { message: 'App name must be at least 3 characters' })
    .max(24, { message: 'App name must be no more than 24 characters' })
    .regex(/^[a-z0-9-]+$/, { message: 'App name can only contain lowercase letters, numbers, and hyphens' }),
  runtimeStack: z.string().optional(),
  projectPath: z.string().default('./'),
});

type DeploymentFormValues = z.infer<typeof deploymentFormSchema>;

interface AzureDeploymentFormProps {
  onDeploymentComplete?: (result: DeploymentResult) => void;
}

// Azure regions
const AZURE_REGIONS = [
  { value: 'eastus', label: 'East US' },
  { value: 'eastus2', label: 'East US 2' },
  { value: 'westus', label: 'West US' },
  { value: 'westus2', label: 'West US 2' },
  { value: 'centralus', label: 'Central US' },
  { value: 'northeurope', label: 'North Europe' },
  { value: 'westeurope', label: 'West Europe' },
  { value: 'southeastasia', label: 'Southeast Asia' },
  { value: 'eastasia', label: 'East Asia' },
  { value: 'japaneast', label: 'Japan East' },
  { value: 'japanwest', label: 'Japan West' },
];

// Runtime stacks for App Service
const APP_SERVICE_STACKS = [
  { value: 'node|16-lts', label: 'Node.js 16 LTS' },
  { value: 'node|18-lts', label: 'Node.js 18 LTS' },
  { value: 'node|20-lts', label: 'Node.js 20 LTS' },
  { value: 'python|3.9', label: 'Python 3.9' },
  { value: 'python|3.10', label: 'Python 3.10' },
  { value: 'python|3.11', label: 'Python 3.11' },
  { value: 'dotnet|6.0', label: '.NET 6.0' },
  { value: 'dotnet|7.0', label: '.NET 7.0' },
  { value: 'java|11-java11', label: 'Java 11' },
  { value: 'java|17-java17', label: 'Java 17' },
];

export default function AzureDeploymentForm({ onDeploymentComplete }: AzureDeploymentFormProps) {
  const [deploymentType, setDeploymentType] = useState<'AppService' | 'StaticWebApp' | 'Container'>('AppService');
  const [isDeploying, setIsDeploying] = useState(false);
  const [createNewResourceGroup, setCreateNewResourceGroup] = useState(false);
  const [subscriptions, setSubscriptions] = useState<AzureResource[]>([]);
  const [resourceGroups, setResourceGroups] = useState<AzureResource[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [isLoadingResourceGroups, setIsLoadingResourceGroups] = useState(false);
  
  // Setup form with default values
  const form = useForm<DeploymentFormValues>({
    resolver: zodResolver(deploymentFormSchema),
    defaultValues: {
      subscriptionId: '',
      resourceGroup: '',
      region: 'eastus',
      appName: '',
      runtimeStack: deploymentType === 'AppService' ? 'node|16-lts' : undefined,
      projectPath: './',
    },
  });
  
  // Load subscriptions on component mount
  useEffect(() => {
    const loadSubscriptions = async () => {
      setIsLoadingSubscriptions(true);
      try {
        const subs = await AzureDeploymentService.getSubscriptions();
        setSubscriptions(subs);
        if (subs.length > 0) {
          form.setValue('subscriptionId', subs[0].id);
          loadResourceGroups(subs[0].id);
        }
      } catch (error) {
        console.error('Error loading subscriptions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load Azure subscriptions. Please check your connection and try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingSubscriptions(false);
      }
    };
    
    loadSubscriptions();
  }, []);
  
  // Load resource groups when subscription changes
  const loadResourceGroups = async (subscriptionId: string) => {
    if (!subscriptionId) return;
    
    setIsLoadingResourceGroups(true);
    try {
      const groups = await AzureDeploymentService.getResourceGroups(subscriptionId);
      setResourceGroups(groups);
    } catch (error) {
      console.error('Error loading resource groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resource groups. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingResourceGroups(false);
    }
  };
  
  // Handle subscription change
  const handleSubscriptionChange = (value: string) => {
    form.setValue('subscriptionId', value);
    loadResourceGroups(value);
    form.setValue('resourceGroup', ''); // Reset resource group when subscription changes
  };
  
  // Handle deployment type change
  const handleDeploymentTypeChange = (value: 'AppService' | 'StaticWebApp' | 'Container') => {
    setDeploymentType(value);
    if (value === 'AppService') {
      form.setValue('runtimeStack', 'node|16-lts');
    } else {
      form.setValue('runtimeStack', undefined);
    }
  };
  
  // Handle form submission
  const onSubmit = async (values: DeploymentFormValues) => {
    setIsDeploying(true);
    
    try {
      let deploymentOptions: DeploymentOptions = {
        ...values,
        deploymentType,
      };
      
      let result: DeploymentResult;
      
      // Create resource group if needed
      if (createNewResourceGroup && values.resourceGroup) {
        const newGroup = await AzureDeploymentService.createResourceGroup(
          values.subscriptionId,
          values.resourceGroup,
          values.region
        );
        
        if (!newGroup) {
          throw new Error('Failed to create resource group');
        }
      }
      
      // Deploy based on selected type
      switch (deploymentType) {
        case 'AppService':
          result = await AzureDeploymentService.deployToAppService(deploymentOptions);
          break;
        case 'StaticWebApp':
          result = await AzureDeploymentService.deployToStaticWebApp(deploymentOptions);
          break;
        case 'Container':
          result = await AzureDeploymentService.deployToContainerApps(deploymentOptions);
          break;
        default:
          throw new Error('Invalid deployment type');
      }
      
      if (result.status === 'failed') {
        throw new Error(result.error || 'Deployment failed');
      }
      
      toast({
        title: 'Deployment initiated',
        description: `Your application deployment has started. Deployment ID: ${result.id}`,
      });
      
      // Notify parent component of deployment completion
      if (onDeploymentComplete) {
        onDeploymentComplete(result);
      }
    } catch (error) {
      console.error('Deployment error:', error);
      toast({
        title: 'Deployment failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Deploy to Azure</CardTitle>
        <CardDescription>
          Deploy your application to Microsoft Azure cloud services
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          defaultValue="AppService" 
          onValueChange={(value) => handleDeploymentTypeChange(value as any)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="AppService" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              App Service
            </TabsTrigger>
            <TabsTrigger value="StaticWebApp" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Static Web App
            </TabsTrigger>
            <TabsTrigger value="Container" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Container Apps
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Azure Account</h3>
                
                {/* Subscription Selection */}
                <FormField
                  control={form.control}
                  name="subscriptionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Azure Subscription</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={handleSubscriptionChange}
                        disabled={isLoadingSubscriptions}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subscription" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subscriptions.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the Azure subscription to deploy to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Resource Group */}
                {createNewResourceGroup ? (
                  <FormField
                    control={form.control}
                    name="resourceGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Resource Group Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter resource group name" />
                        </FormControl>
                        <FormDescription>
                          A new resource group will be created in the selected region
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="resourceGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource Group</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLoadingResourceGroups}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a resource group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {resourceGroups.map((group) => (
                              <SelectItem key={group.id} value={group.name}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select an existing resource group
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateNewResourceGroup(!createNewResourceGroup)}
                  >
                    {createNewResourceGroup ? 'Use Existing Resource Group' : 'Create New Resource Group'}
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="text-lg font-medium">App Configuration</h3>
                
                {/* App Name */}
                <FormField
                  control={form.control}
                  name="appName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="my-awesome-app" />
                      </FormControl>
                      <FormDescription>
                        This will form part of your app's URL: {field.value}.azurewebsites.net
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Region Selection */}
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AZURE_REGIONS.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the Azure region to deploy your app
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Runtime Stack (App Service only) */}
                {deploymentType === 'AppService' && (
                  <FormField
                    control={form.control}
                    name="runtimeStack"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Runtime Stack</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a runtime stack" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {APP_SERVICE_STACKS.map((stack) => (
                              <SelectItem key={stack.value} value={stack.value}>
                                {stack.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the runtime environment for your application
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Project Path */}
                <FormField
                  control={form.control}
                  name="projectPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Path</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="./" />
                      </FormControl>
                      <FormDescription>
                        The path to your project relative to the workspace root
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" disabled={isDeploying} className="w-full">
                {isDeploying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  'Deploy to Azure'
                )}
              </Button>
            </form>
          </Form>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Deployment will be initiated using your Microsoft Entra ID credentials
        </p>
      </CardFooter>
    </Card>
  );
}