import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Share2,
  BarChart2,
  Github,
  Users,
  BadgeCheck,
  Brain,
  BrainCircuit,
  Layers,
  ChevronRight,
  RocketIcon,
} from 'lucide-react';

import CodeSharing from '@/components/code-sharing';
import CodePlayground from '@/components/code-playground';
import GitIntegration from '@/components/git-integration';
import RealTimeCollaboration from '@/components/real-time-collaboration';
import EnhancedAiDebugging from '@/components/enhanced-ai-debugging';
import AzureCICDPipeline from '@/components/azure-cicd-pipeline';
import ComplexityIndicator from '@/components/complexity-indicator';

/**
 * Advanced Features Page
 * 
 * This page provides access to all the advanced features of the CloudIDE platform,
 * including code sharing, collaboration, Git integration, and more.
 */
export default function AdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState('code-sharing');

  const features = [
    {
      id: 'code-sharing',
      title: 'Code Sharing',
      description: 'Share code snippets with custom vanity URLs and track complexity',
      icon: Share2,
      component: <CodeSharing />,
    },
    {
      id: 'code-playground',
      title: 'Interactive Playground',
      description: 'Try out code snippets in a live environment with real-time preview',
      icon: RocketIcon,
      component: <CodePlayground />,
    },
    {
      id: 'git-integration',
      title: 'Git Integration',
      description: 'Manage your Git repositories with visual commit history and branches',
      icon: Github,
      component: <GitIntegration />,
    },
    {
      id: 'real-time-collaboration',
      title: 'Real-Time Collaboration',
      description: 'Work with others in real-time with shared editing and chat',
      icon: Users,
      component: <RealTimeCollaboration />,
    },
    {
      id: 'enhanced-ai-debugging',
      title: 'AI-Powered Debugging',
      description: 'Get intelligent debugging suggestions and code optimizations',
      icon: BrainCircuit,
      component: <EnhancedAiDebugging />,
    },
    {
      id: 'azure-cicd',
      title: 'Azure CI/CD Integration',
      description: 'Set up and manage CI/CD pipelines for your projects',
      icon: Layers,
      component: <AzureCICDPipeline />,
    },
  ];

  return (
    <div className="container max-w-7xl py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Advanced Features</h1>
          <p className="text-muted-foreground">
            Explore the powerful tools and capabilities of the CloudIDE platform
          </p>
        </div>

        {/* Feature Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {features.map((feature) => (
            <Card
              key={feature.id}
              className={`cursor-pointer transition-all hover:border-primary ${
                activeTab === feature.id ? 'border-primary bg-muted/50' : ''
              }`}
              onClick={() => setActiveTab(feature.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  {activeTab === feature.id && (
                    <BadgeCheck className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="min-h-[40px]">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Feature Area */}
        <div className="w-full">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={activeTab === feature.id ? 'block' : 'hidden'}
            >
              {feature.component}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-10 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">More Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">View AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Access AI coding assistance features</p>
                <Button asChild className="w-full mt-4" variant="outline">
                  <Link href="/ai-assistant">
                    <Brain className="h-4 w-4 mr-2" />
                    Go to AI Assistant
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Manage Azure Deployments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Configure and deploy to Azure services</p>
                <Button asChild className="w-full mt-4" variant="outline">
                  <Link href="/deployments">
                    <Layers className="h-4 w-4 mr-2" />
                    Go to Deployments
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Project Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">View insights and statistics for your project</p>
                <Button asChild className="w-full mt-4" variant="outline">
                  <Link href="/analytics">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    View Analytics
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Code Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Return to the main code editor interface</p>
                <Button asChild className="w-full mt-4" variant="outline">
                  <Link href="/">
                    <ChevronRight className="h-4 w-4 ml-auto" />
                    Return to Editor
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}