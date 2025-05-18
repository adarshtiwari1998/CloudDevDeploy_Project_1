import React, { useState } from 'react';
import ContextAwareCodeGenerator from '../components/context-aware-code-generator';
import CodeExplanation from '../components/code-explanation';
import AiDebugging from '../components/ai-debugging';
import TestGenerator from '../components/test-generator';
import RefactoringAssistant from '../components/refactoring-assistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Sparkles, Code, Bug, TestTube2, Wand2 } from 'lucide-react';

export default function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState('code-generation');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
        AI Coding Assistant
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="code-generation" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Code Generation</span>
            <span className="sm:hidden">Generate</span>
          </TabsTrigger>
          
          <TabsTrigger value="code-explanation" className="flex items-center gap-1">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Code Explanation</span>
            <span className="sm:hidden">Explain</span>
          </TabsTrigger>
          
          <TabsTrigger value="debugging" className="flex items-center gap-1">
            <Bug className="h-4 w-4" />
            <span className="hidden sm:inline">AI Debugging</span>
            <span className="sm:hidden">Debug</span>
          </TabsTrigger>
          
          <TabsTrigger value="testing" className="flex items-center gap-1">
            <TestTube2 className="h-4 w-4" />
            <span className="hidden sm:inline">Unit Testing</span>
            <span className="sm:hidden">Test</span>
          </TabsTrigger>
          
          <TabsTrigger value="refactoring" className="flex items-center gap-1">
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">Refactoring</span>
            <span className="sm:hidden">Refactor</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="code-generation" className="space-y-4">
          <ContextAwareCodeGenerator />
        </TabsContent>
        
        <TabsContent value="code-explanation" className="space-y-4">
          <CodeExplanation />
        </TabsContent>
        
        <TabsContent value="debugging" className="space-y-4">
          <AiDebugging />
        </TabsContent>
        
        <TabsContent value="testing" className="space-y-4">
          <TestGenerator />
        </TabsContent>
        
        <TabsContent value="refactoring" className="space-y-4">
          <RefactoringAssistant />
        </TabsContent>
      </Tabs>
      
      <Card className="p-4 mt-8 text-center">
        <p className="text-sm text-gray-500">
          These AI-powered tools help you write better code faster. Select a tool from the tabs above to get started.
        </p>
      </Card>
    </div>
  );
}