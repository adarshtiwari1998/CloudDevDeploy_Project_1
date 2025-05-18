import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import {
  Lightbulb,
  Code,
  Copy,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Search,
  Clock,
  TagIcon,
  HistoryIcon,
  BookmarkIcon,
  PlusCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { AnimatedCodeGeneration } from './animated-code-generation';
import ComplexityIndicator from './complexity-indicator';

interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  description: string;
  tags: string[];
  relevance: number; // 0-100
  complexity: number; // 1-5
  source?: string;
}

interface CodeSnippetRecommendationsProps {
  currentCode?: string;
  currentLanguage?: string;
  recentSearches?: string[];
  onInsertSnippet?: (snippet: CodeSnippet) => void;
}

/**
 * AI-Powered Code Snippet Recommendation Sidebar
 * 
 * This component analyzes the current code context and suggests relevant
 * code snippets that can be inserted into the editor.
 */
export default function CodeSnippetRecommendations({
  currentCode = '',
  currentLanguage = 'javascript',
  recentSearches = [],
  onInsertSnippet
}: CodeSnippetRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<'contextual' | 'search' | 'saved'>('contextual');
  const [isLoading, setIsLoading] = useState(true);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CodeSnippet[]>([]);
  const [savedSnippets, setSavedSnippets] = useState<CodeSnippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [showSnippetDetail, setShowSnippetDetail] = useState(false);
  
  // Load contextual recommendations when current code changes
  useEffect(() => {
    if (currentCode) {
      loadContextualRecommendations();
    }
  }, [currentCode, currentLanguage]);
  
  // Load saved snippets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saved-snippets');
    if (saved) {
      try {
        setSavedSnippets(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved snippets:', error);
      }
    }
  }, []);
  
  // Load contextual recommendations based on current code
  const loadContextualRecommendations = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API to get AI-powered recommendations
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Example hardcoded snippets for demonstration
      const mockSnippets: CodeSnippet[] = [
        {
          id: '1',
          title: 'Fetch API with error handling',
          code: `async function fetchData(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! Status: \${response.status}\`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}`,
          language: 'javascript',
          description: 'A robust fetch function with proper error handling and async/await pattern.',
          tags: ['fetch', 'api', 'async', 'error-handling'],
          relevance: 95,
          complexity: 2,
        },
        {
          id: '2',
          title: 'React useEffect cleanup',
          code: `useEffect(() => {
  // Setup code here (e.g. event listeners, subscriptions)
  const subscription = someExternalAPI.subscribe();
  
  // Cleanup function to prevent memory leaks
  return () => {
    subscription.unsubscribe();
  };
}, [dependency1, dependency2]);`,
          language: 'javascript',
          description: 'Proper useEffect hook with cleanup to prevent memory leaks.',
          tags: ['react', 'hooks', 'useEffect', 'cleanup'],
          relevance: 87,
          complexity: 2,
        },
        {
          id: '3',
          title: 'Throttle function',
          code: `function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Usage
const throttledScroll = throttle(() => {
  console.log('Scroll event throttled');
}, 300);

window.addEventListener('scroll', throttledScroll);`,
          language: 'javascript',
          description: 'Throttle function to limit the rate at which a function can fire.',
          tags: ['performance', 'throttle', 'optimization'],
          relevance: 78,
          complexity: 3,
        },
        {
          id: '4',
          title: 'Framer Motion fade-in animation',
          code: `import { motion } from 'framer-motion';

export const FadeIn = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);`,
          language: 'javascript',
          description: 'Simple fade-in animation component using Framer Motion.',
          tags: ['animation', 'framer-motion', 'react'],
          relevance: 65,
          complexity: 1,
        },
      ];
      
      setSnippets(mockSnippets);
      
    } catch (error) {
      console.error('Error loading recommendations:', error);
      
      toast({
        title: "Failed to load recommendations",
        description: "Could not fetch code snippet recommendations. Please try again.",
        variant: "destructive",
      });
      
    } finally {
      setIsLoading(false);
    }
  };
  
  // Search for code snippets
  const searchSnippets = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API to search for snippets
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter existing snippets for demo purposes
      const results = snippets.filter(snippet => 
        snippet.title.toLowerCase().includes(query.toLowerCase()) || 
        snippet.description.toLowerCase().includes(query.toLowerCase()) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults(results);
      
    } catch (error) {
      console.error('Error searching snippets:', error);
      
      toast({
        title: "Search failed",
        description: "Could not search for code snippets. Please try again.",
        variant: "destructive",
      });
      
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save snippet to localStorage
  const saveSnippet = (snippet: CodeSnippet) => {
    // Check if already saved
    if (savedSnippets.some(s => s.id === snippet.id)) {
      // Remove from saved snippets
      const updated = savedSnippets.filter(s => s.id !== snippet.id);
      setSavedSnippets(updated);
      localStorage.setItem('saved-snippets', JSON.stringify(updated));
      
      toast({
        title: "Snippet removed",
        description: "The code snippet has been removed from your saved items.",
      });
    } else {
      // Add to saved snippets
      const updated = [...savedSnippets, snippet];
      setSavedSnippets(updated);
      localStorage.setItem('saved-snippets', JSON.stringify(updated));
      
      toast({
        title: "Snippet saved",
        description: "The code snippet has been saved for future use.",
      });
    }
  };
  
  // Copy snippet to clipboard
  const copySnippet = (snippet: CodeSnippet) => {
    navigator.clipboard.writeText(snippet.code);
    
    toast({
      title: "Copied to clipboard",
      description: "The code snippet has been copied to your clipboard.",
    });
  };
  
  // Insert snippet into editor
  const insertSnippet = (snippet: CodeSnippet) => {
    if (onInsertSnippet) {
      onInsertSnippet(snippet);
      
      toast({
        title: "Snippet inserted",
        description: "The code snippet has been inserted into your editor.",
      });
    }
  };
  
  // Provide feedback on snippet
  const provideFeedback = (snippet: CodeSnippet, isPositive: boolean) => {
    // In a real app, this would call an API to record feedback
    
    toast({
      title: "Feedback recorded",
      description: `Thank you for your ${isPositive ? 'positive' : 'negative'} feedback.`,
    });
  };
  
  // Render snippet card
  const renderSnippetCard = (snippet: CodeSnippet) => {
    const isSaved = savedSnippets.some(s => s.id === snippet.id);
    
    return (
      <motion.div
        key={snippet.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-3 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm">{snippet.title}</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => saveSnippet(snippet)}
                >
                  <BookmarkIcon className={`h-4 w-4 ${isSaved ? 'fill-primary' : ''}`} />
                </Button>
              </div>
            </div>
            <CardDescription className="line-clamp-2 text-xs">
              {snippet.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0 pb-2">
            <div className="max-h-20 overflow-hidden relative">
              <pre className="text-xs font-mono p-2 bg-muted rounded-md">
                <code className="language-javascript line-clamp-3">
                  {snippet.code}
                </code>
              </pre>
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {snippet.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="pt-0 flex justify-between">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => copySnippet(snippet)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setSelectedSnippet(snippet);
                  setShowSnippetDetail(true);
                }}
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-1">
              <ComplexityIndicator
                value={snippet.complexity}
                size="sm"
                showLabel={false}
              />
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };
  
  // Render snippet detail
  const renderSnippetDetail = () => {
    if (!selectedSnippet) return null;
    
    const isSaved = savedSnippets.some(s => s.id === selectedSnippet.id);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-xl max-h-[90vh] overflow-auto bg-background border rounded-lg shadow-lg"
          >
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-background z-10">
              <h3 className="text-lg font-medium">{selectedSnippet.title}</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSnippetDetail(false)}
              >
                <span className="sr-only">Close</span>
                <span className="text-lg">&times;</span>
              </Button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">{selectedSnippet.description}</p>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">Code Snippet:</div>
                  <ComplexityIndicator
                    value={selectedSnippet.complexity}
                    size="sm"
                  />
                </div>
                
                <Tabs defaultValue="code">
                  <TabsList className="w-full">
                    <TabsTrigger value="code" className="flex-1">
                      <Code className="h-3.5 w-3.5 mr-1" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="animated" className="flex-1">
                      <Lightbulb className="h-3.5 w-3.5 mr-1" />
                      Animated
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="code">
                    <pre className="p-3 bg-muted font-mono text-sm rounded-md overflow-x-auto">
                      <code>{selectedSnippet.code}</code>
                    </pre>
                  </TabsContent>
                  
                  <TabsContent value="animated">
                    <AnimatedCodeGeneration
                      code={selectedSnippet.code}
                      language={selectedSnippet.language}
                      initialSpeed={10}
                      className="rounded-md overflow-hidden"
                    />
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedSnippet.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {selectedSnippet.source && (
                <div className="text-xs text-muted-foreground mb-4">
                  Source: {selectedSnippet.source}
                </div>
              )}
              
              <div className="flex justify-between pt-2 border-t">
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => insertSnippet(selectedSnippet)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Insert into Editor
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copySnippet(selectedSnippet)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => saveSnippet(selectedSnippet)}
                >
                  <BookmarkIcon className={`h-4 w-4 ${isSaved ? 'fill-primary' : ''}`} />
                </Button>
              </div>
              
              <div className="flex justify-center gap-4 mt-6 pt-4 border-t">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => provideFeedback(selectedSnippet, true)}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Helpful
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => provideFeedback(selectedSnippet, false)}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Not Helpful
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <>
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Lightbulb className="h-4 w-4 text-primary mr-2" />
            Code Recommendations
          </CardTitle>
          <CardDescription className="text-xs">
            AI-powered snippet suggestions based on your code
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-2 pb-2 flex-1 overflow-hidden">
          <Tabs 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
            className="h-full flex flex-col"
          >
            <TabsList className="w-full">
              <TabsTrigger value="contextual" className="flex-1 text-xs">
                <Lightbulb className="h-3.5 w-3.5 mr-1" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="search" className="flex-1 text-xs">
                <Search className="h-3.5 w-3.5 mr-1" />
                Search
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex-1 text-xs">
                <BookmarkIcon className="h-3.5 w-3.5 mr-1" />
                Saved
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="contextual" className="h-full mt-2 overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg animate-pulse">
                        <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                        <div className="h-16 bg-muted rounded mb-2"></div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-muted rounded w-16"></div>
                          <div className="h-6 bg-muted rounded w-6"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : snippets.length > 0 ? (
                  snippets.map(snippet => renderSnippetCard(snippet))
                ) : (
                  <div className="text-center p-8">
                    <Lightbulb className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="font-medium">No recommendations yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start coding to get AI-powered snippet suggestions
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="search" className="h-full mt-2">
                <div className="relative mb-3">
                  <input
                    type="text"
                    className="w-full p-2 pl-8 text-sm border rounded-md"
                    placeholder="Search for code snippets..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchSnippets(e.target.value);
                    }}
                  />
                  <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                </div>
                
                {recentSearches.length > 0 && !searchQuery && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium mb-2 flex items-center">
                      <HistoryIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                      Recent Searches
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {recentSearches.map((search, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => {
                            setSearchQuery(search);
                            searchSnippets(search);
                          }}
                        >
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="overflow-y-auto">
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array(2).fill(0).map((_, i) => (
                        <div key={i} className="p-4 border rounded-lg animate-pulse">
                          <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                          <div className="h-16 bg-muted rounded mb-2"></div>
                          <div className="flex gap-2">
                            <div className="h-6 bg-muted rounded w-16"></div>
                            <div className="h-6 bg-muted rounded w-6"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    searchResults.length > 0 ? (
                      searchResults.map(snippet => renderSnippetCard(snippet))
                    ) : (
                      <div className="text-center p-8 border rounded-md">
                        <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <h3 className="font-medium">No results found</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center p-8 border rounded-md">
                      <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <h3 className="font-medium">Search for code snippets</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Type above to find reusable code snippets
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="saved" className="h-full mt-2 overflow-y-auto">
                {savedSnippets.length > 0 ? (
                  savedSnippets.map(snippet => renderSnippetCard(snippet))
                ) : (
                  <div className="text-center p-8 border rounded-md">
                    <BookmarkIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="font-medium">No saved snippets</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bookmark useful code snippets for future use
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
        
        <CardFooter className="px-2 pt-0 pb-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center">
              <TagIcon className="h-3 w-3 mr-1" />
              <span>{snippets.length} snippets available</span>
            </div>
            
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={loadContextualRecommendations}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {showSnippetDetail && renderSnippetDetail()}
    </>
  );
}

const RotateCcw = ({ className }: { className?: string }) => (
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
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);