import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { toast } from '@/hooks/use-toast';
import { AnimatedCodeGeneration } from './animated-code-generation';
import ComplexityIndicator from './complexity-indicator';
import { 
  Brain, Bug, Sparkles, Zap, 
  RefreshCw, ArrowRight, Lightbulb, AlertTriangle, 
  CheckCircle2, XCircle, Search, CPU, BarChart4, 
  FileCode, Info, HelpCircle, BrainCircuit
} from 'lucide-react';

interface Issue {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  location: {
    file: string;
    line: number;
    column: number;
  };
  code: string;
  explanation: string;
  solution: string;
  complexity: number;
}

interface OptimizationSuggestion {
  id: string;
  type: 'performance' | 'memory' | 'security' | 'readability';
  description: string;
  impact: 'high' | 'medium' | 'low';
  before: string;
  after: string;
  explanation: string;
  complexity: number;
}

/**
 * Enhanced AI-Powered Debugging Component
 * 
 * This component provides advanced debugging capabilities with smart complexity
 * indicators and detailed code optimization suggestions.
 */
export default function EnhancedAiDebugging() {
  const [activeTab, setActiveTab] = useState<'issues' | 'optimizations'>('issues');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<OptimizationSuggestion | null>(null);

  // Analyze code for issues and optimization opportunities
  const analyzeCode = async () => {
    setIsAnalyzing(true);
    
    try {
      // In a real app, this would make an API call to analyze the code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock issues for demonstration
      const mockIssues: Issue[] = [
        {
          id: '1',
          type: 'error',
          message: 'Uncaught TypeError: Cannot read property "length" of undefined',
          location: {
            file: 'main.js',
            line: 24,
            column: 15,
          },
          code: 'function processItems(items) {\n  for (let i = 0; i < items.length; i++) {\n    // Process each item\n    processItem(items[i]);\n  }\n}',
          explanation: 'The function tries to access the "length" property of "items" without checking if "items" is defined first.',
          solution: 'function processItems(items) {\n  if (!items || !Array.isArray(items)) {\n    return; // Early return for invalid input\n  }\n  \n  for (let i = 0; i < items.length; i++) {\n    // Process each item\n    processItem(items[i]);\n  }\n}',
          complexity: 2,
        },
        {
          id: '2',
          type: 'warning',
          message: 'Memory leak detected in event listener',
          location: {
            file: 'components/widget.js',
            line: 45,
            column: 10,
          },
          code: 'function setupWidget() {\n  const button = document.getElementById("submit-btn");\n  button.addEventListener("click", function() {\n    // This creates a closure that may hold references\n    const data = getExpensiveData();\n    processData(data);\n  });\n}',
          explanation: 'Event listeners create closures that can lead to memory leaks if not properly removed, especially in components that are frequently created and destroyed.',
          solution: 'function setupWidget() {\n  const button = document.getElementById("submit-btn");\n  \n  // Define the handler separately so it can be removed\n  const handleClick = function() {\n    const data = getExpensiveData();\n    processData(data);\n  };\n  \n  button.addEventListener("click", handleClick);\n  \n  // Return a cleanup function\n  return function cleanup() {\n    button.removeEventListener("click", handleClick);\n  };\n}',
          complexity: 3,
        },
        {
          id: '3',
          type: 'info',
          message: 'Promise chain lacks error handling',
          location: {
            file: 'services/api.js',
            line: 87,
            column: 3,
          },
          code: 'function fetchUserData(userId) {\n  return fetch(`/api/users/${userId}`)\n    .then(response => response.json())\n    .then(data => {\n      return processUserData(data);\n    });\n}',
          explanation: 'The Promise chain does not have any error handling, which could lead to unhandled promise rejections if the API request fails.',
          solution: 'function fetchUserData(userId) {\n  return fetch(`/api/users/${userId}`)\n    .then(response => {\n      if (!response.ok) {\n        throw new Error(`API error: ${response.status}`);\n      }\n      return response.json();\n    })\n    .then(data => {\n      return processUserData(data);\n    })\n    .catch(error => {\n      console.error("Failed to fetch user data:", error);\n      throw error; // Re-throw or handle as needed\n    });\n}',
          complexity: 2,
        },
      ];
      
      // Mock optimization suggestions for demonstration
      const mockSuggestions: OptimizationSuggestion[] = [
        {
          id: '1',
          type: 'performance',
          description: 'Optimize array iteration using modern methods',
          impact: 'medium',
          before: 'const result = [];\nfor (let i = 0; i < data.length; i++) {\n  if (data[i] > 10) {\n    result.push(data[i] * 2);\n  }\n}',
          after: 'const result = data\n  .filter(item => item > 10)\n  .map(item => item * 2);',
          explanation: 'Modern array methods like filter() and map() provide a more declarative approach and can be more efficient than traditional for loops for these transformation operations.',
          complexity: 1,
        },
        {
          id: '2',
          type: 'memory',
          description: 'Reduce memory usage in large lists rendering',
          impact: 'high',
          before: 'function renderList(items) {\n  const container = document.getElementById("list-container");\n  \n  // Clear previous items\n  container.innerHTML = "";\n  \n  // Render all items at once\n  items.forEach(item => {\n    const div = document.createElement("div");\n    div.textContent = item.name;\n    container.appendChild(div);\n  });\n}',
          after: 'function renderList(items) {\n  const container = document.getElementById("list-container");\n  \n  // Clear previous items\n  container.innerHTML = "";\n  \n  // Use DocumentFragment for better performance\n  const fragment = document.createDocumentFragment();\n  \n  // Implement virtual windowing for large lists\n  const visibleItems = items.slice(0, 50); // Show first 50 items initially\n  \n  visibleItems.forEach(item => {\n    const div = document.createElement("div");\n    div.textContent = item.name;\n    fragment.appendChild(div);\n  });\n  \n  container.appendChild(fragment);\n  \n  // Add a scroll listener to load more items as needed\n  if (items.length > 50) {\n    setupInfiniteScroll(container, items);\n  }\n}',
          explanation: 'Using DocumentFragment reduces DOM reflows and repaints. Implementing virtual windowing or infinite scrolling for large lists drastically reduces memory usage and improves rendering performance.',
          complexity: 4,
        },
        {
          id: '3',
          type: 'security',
          description: 'Prevent XSS vulnerability in user content rendering',
          impact: 'high',
          before: 'function displayUserComment(comment) {\n  const commentDiv = document.getElementById("comment-section");\n  commentDiv.innerHTML = comment.text;\n}',
          after: 'function displayUserComment(comment) {\n  const commentDiv = document.getElementById("comment-section");\n  \n  // Create a text node instead of using innerHTML\n  const textNode = document.createTextNode(comment.text);\n  \n  // Clear previous content\n  commentDiv.innerHTML = "";\n  commentDiv.appendChild(textNode);\n  \n  // Alternatively, use textContent which is safer than innerHTML\n  // commentDiv.textContent = comment.text;\n}',
          explanation: 'Using innerHTML with user-generated content creates a serious XSS (Cross-Site Scripting) vulnerability. Creating text nodes or using textContent ensures that content is treated as text only, not executable HTML.',
          complexity: 3,
        },
      ];
      
      setIssues(mockIssues);
      setSuggestions(mockSuggestions);
      setSelectedIssue(mockIssues[0]);
      setSelectedSuggestion(mockSuggestions[0]);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${mockIssues.length} issues and ${mockSuggestions.length} optimization opportunities.`,
      });
      
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Apply a suggested fix
  const applyFix = (type: 'issue' | 'optimization', id: string) => {
    toast({
      title: "Fix Applied",
      description: `The suggested changes have been applied to your code.`,
    });
    
    // In a real app, this would modify the actual code
  };
  
  // Get icon for issue type
  const getIssueIcon = (type: Issue['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };
  
  // Get icon for optimization type
  const getOptimizationIcon = (type: OptimizationSuggestion['type']) => {
    switch (type) {
      case 'performance':
        return <Zap className="h-4 w-4 text-amber-500" />;
      case 'memory':
        return <CPU className="h-4 w-4 text-blue-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'readability':
        return <FileCode className="h-4 w-4 text-green-500" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };
  
  // Get badge color for impact level
  const getImpactBadgeVariant = (impact: OptimizationSuggestion['impact']) => {
    switch (impact) {
      case 'high':
        return "destructive";
      case 'medium':
        return "default";
      case 'low':
        return "outline";
      default:
        return "secondary";
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              Enhanced AI Debugging
            </CardTitle>
            <CardDescription>
              Intelligent debugging and code optimization powered by AI
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'issues' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('issues')}
            >
              <Bug className="h-4 w-4 mr-2" />
              Issues ({issues.length})
            </Button>
            
            <Button 
              variant={activeTab === 'optimizations' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('optimizations')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Optimizations ({suggestions.length})
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <Label htmlFor="code-input" className="mb-2 block">Paste code for analysis</Label>
          <div className="relative">
            <textarea
              id="code-input"
              className="w-full h-[150px] p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none rounded-md"
              placeholder="// Paste your code here for AI-powered debugging and optimization suggestions"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
            ></textarea>
            
            <Button
              className="absolute right-2 bottom-2"
              onClick={analyzeCode}
              disabled={isAnalyzing || !codeInput.trim()}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Code
                </>
              )}
            </Button>
          </div>
        </div>
        
        {(issues.length > 0 || suggestions.length > 0) && (
          <div className="grid md:grid-cols-5 gap-6">
            {/* List of issues or optimizations */}
            <div className="md:col-span-2 border rounded-md overflow-hidden">
              <div className="p-3 bg-muted border-b">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  {activeTab === 'issues' ? (
                    <>
                      <Bug className="h-4 w-4" />
                      <span>Detected Issues</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Optimization Suggestions</span>
                    </>
                  )}
                </h3>
              </div>
              
              <div className="p-2 max-h-[400px] overflow-y-auto">
                {activeTab === 'issues' ? (
                  <div className="space-y-2">
                    {issues.map(issue => (
                      <div
                        key={issue.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedIssue?.id === issue.id 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedIssue(issue)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getIssueIcon(issue.type)}
                            <span className="font-medium text-sm capitalize">
                              {issue.type}
                            </span>
                          </div>
                          
                          <ComplexityIndicator
                            value={issue.complexity}
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                        
                        <p className="text-sm line-clamp-2">{issue.message}</p>
                        
                        <div className="mt-1 text-xs text-muted-foreground">
                          {issue.location.file}:{issue.location.line}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {suggestions.map(suggestion => (
                      <div
                        key={suggestion.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedSuggestion?.id === suggestion.id 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedSuggestion(suggestion)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getOptimizationIcon(suggestion.type)}
                            <span className="font-medium text-sm capitalize">
                              {suggestion.type}
                            </span>
                          </div>
                          
                          <Badge variant={getImpactBadgeVariant(suggestion.impact)}>
                            {suggestion.impact} impact
                          </Badge>
                        </div>
                        
                        <p className="text-sm line-clamp-2">{suggestion.description}</p>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <ComplexityIndicator
                            value={suggestion.complexity}
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Details for selected issue or optimization */}
            <div className="md:col-span-3 border rounded-md overflow-hidden">
              <div className="p-3 bg-muted border-b">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  {activeTab === 'issues' ? (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Issue Details & Solution</span>
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4" />
                      <span>Optimization Details</span>
                    </>
                  )}
                </h3>
              </div>
              
              <div className="p-4 max-h-[400px] overflow-y-auto">
                {activeTab === 'issues' && selectedIssue ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-base font-medium mb-1">{selectedIssue.message}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>In {selectedIssue.location.file}</span>
                        <span>Line {selectedIssue.location.line}</span>
                        <span>Column {selectedIssue.location.column}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Explanation</Label>
                      <p className="text-sm">{selectedIssue.explanation}</p>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Problematic Code</Label>
                      <pre className="p-3 bg-gray-900 text-gray-100 rounded-md text-sm font-mono overflow-x-auto">
                        {selectedIssue.code}
                      </pre>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Recommended Solution</Label>
                        <ComplexityIndicator
                          value={selectedIssue.complexity}
                          size="sm"
                        />
                      </div>
                      
                      <Tabs defaultValue="code">
                        <TabsList className="w-full">
                          <TabsTrigger value="code" className="flex-1">
                            Code
                          </TabsTrigger>
                          <TabsTrigger value="animated" className="flex-1">
                            Animated
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="code">
                          <pre className="p-3 bg-gray-900 text-gray-100 rounded-md text-sm font-mono overflow-x-auto">
                            {selectedIssue.solution}
                          </pre>
                        </TabsContent>
                        
                        <TabsContent value="animated">
                          <AnimatedCodeGeneration
                            code={selectedIssue.solution}
                            language="javascript"
                            initialSpeed={5}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => applyFix('issue', selectedIssue.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Apply Fix
                      </Button>
                    </div>
                  </div>
                ) : activeTab === 'optimizations' && selectedSuggestion ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-medium">{selectedSuggestion.description}</h4>
                        <Badge variant={getImpactBadgeVariant(selectedSuggestion.impact)}>
                          {selectedSuggestion.impact} impact
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{selectedSuggestion.type} optimization</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Explanation</Label>
                      <p className="text-sm">{selectedSuggestion.explanation}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block">Current Code</Label>
                        <pre className="p-3 bg-gray-900 text-gray-100 rounded-md text-sm font-mono overflow-x-auto h-[150px]">
                          {selectedSuggestion.before}
                        </pre>
                      </div>
                      
                      <div>
                        <Label className="mb-2 block flex items-center justify-between">
                          <span>Optimized Code</span>
                          <ComplexityIndicator
                            value={selectedSuggestion.complexity}
                            size="sm"
                            showLabel={false}
                          />
                        </Label>
                        <pre className="p-3 bg-gray-900 text-gray-100 rounded-md text-sm font-mono overflow-x-auto h-[150px]">
                          {selectedSuggestion.after}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Tabs defaultValue="side-by-side">
                        <TabsList className="w-full">
                          <TabsTrigger value="side-by-side" className="flex-1">
                            Side by Side
                          </TabsTrigger>
                          <TabsTrigger value="animated" className="flex-1">
                            Animated Transformation
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="side-by-side">
                          <div className="p-3 border rounded-md mt-2">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>Before</span>
                              <ArrowRight className="h-4 w-4" />
                              <span>After</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="p-2 bg-muted rounded">
                                <BarChart4 className="h-4 w-4 mx-auto mb-1" />
                                <span className="text-xs">Lower Performance</span>
                              </div>
                              <div className="p-2 bg-muted rounded text-green-500">
                                <BarChart4 className="h-4 w-4 mx-auto mb-1" />
                                <span className="text-xs">Higher Performance</span>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="animated">
                          <AnimatedCodeGeneration
                            code={selectedSuggestion.after}
                            language="javascript"
                            initialSpeed={5}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => applyFix('optimization', selectedSuggestion.id)}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Apply Optimization
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    Select an item to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>Using Enhanced AI Model for analysis</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={() => {
            setCodeInput('');
            setIssues([]);
            setSuggestions([]);
            setSelectedIssue(null);
            setSelectedSuggestion(null);
          }}
        >
          Clear Results
        </Button>
      </CardFooter>
    </Card>
  );
}

const Shield = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);