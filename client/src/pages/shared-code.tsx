import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Button, buttonVariants 
} from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AnimatedCodeGeneration } from '@/components/animated-code-generation';
import { 
  Copy, Eye, Calendar, Clock, User, Globe, Lock, Link2, 
  Download, ExternalLink, Share2, Heart, MessageSquare, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Emoticons for code mood
const moodEmoticons: Record<string, { emoji: string, description: string }> = {
  happy: { emoji: '😊', description: 'Clean, well-structured code' },
  proud: { emoji: '🚀', description: 'Elegant solution, optimized' },
  neutral: { emoji: '😐', description: 'Gets the job done' },
  tired: { emoji: '😫', description: 'Works but needs refactoring' },
  confused: { emoji: '🤔', description: 'Not sure if this is right' },
  frustrated: { emoji: '😤', description: 'Complex problem to solve' },
  experimental: { emoji: '🧪', description: 'Just trying something new' },
};

// Complexity colors
const complexityColors = [
  'bg-green-500 text-white', // Very simple (1)
  'bg-green-300 text-black', // Simple (2)
  'bg-yellow-300 text-black', // Moderate (3)
  'bg-orange-400 text-black', // Complex (4)
  'bg-red-500 text-white',    // Very complex (5)
];

// Complexity labels
const complexityLabels = [
  'Very Simple',
  'Simple',
  'Moderate',
  'Complex',
  'Very Complex',
];

export default function SharedCodePage() {
  const [, params] = useRoute('/s/:vanityUrl');
  const vanityUrl = params?.vanityUrl;
  
  const [loading, setLoading] = useState(true);
  const [snippet, setSnippet] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  
  // Fetch code snippet data
  useEffect(() => {
    if (!vanityUrl) return;
    
    const fetchSnippet = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API call
        // For now, using mock data for demonstration
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real application, this data would come from an API request
        setSnippet({
          id: 123,
          title: "React Custom Hook For API Calls",
          description: "A reusable custom hook for handling API requests with loading and error states",
          code: `import { useState, useEffect } from 'react';

/**
 * Custom hook for handling API requests
 * @param {string} url - The API endpoint to fetch from
 * @param {Object} options - Fetch options
 * @returns {Object} { data, loading, error }
 */
export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(\`HTTP error! Status: \${response.status}\`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}`,
          language: "javascript",
          mood: "proud",
          complexity: 2,
          isPublic: true,
          views: 127,
          createdAt: "2023-06-15T10:30:00Z",
          user: {
            id: 1,
            username: "jane_developer",
          }
        });
        
        setLikeCount(42);
        
      } catch (err) {
        setError("Failed to load the code snippet. It may have been removed or made private.");
        setSnippet(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSnippet();
  }, [vanityUrl]);
  
  const copyToClipboard = () => {
    if (snippet?.code) {
      navigator.clipboard.writeText(snippet.code);
      toast({
        title: "Code copied to clipboard",
        description: "You can now paste it anywhere.",
      });
    }
  };
  
  const downloadCode = () => {
    if (snippet?.code) {
      const fileExtension = getFileExtension(snippet.language);
      const fileName = `${snippet.title.toLowerCase().replace(/\s+/g, '-')}.${fileExtension}`;
      const blob = new Blob([snippet.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  const getFileExtension = (language: string): string => {
    const extensionMap: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      swift: 'swift',
      kotlin: 'kt',
      dart: 'dart',
      sql: 'sql',
      html: 'html',
      css: 'css',
      xml: 'xml',
      json: 'json',
      yaml: 'yml',
      markdown: 'md',
      shell: 'sh',
    };
    
    return extensionMap[language] || 'txt';
  };
  
  const toggleLike = () => {
    if (hasLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setHasLiked(!hasLiked);
  };
  
  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied to clipboard",
      description: "You can now share it with others.",
    });
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <Card className="w-full">
          <CardHeader className="animate-pulse">
            <div className="h-6 w-2/3 bg-muted rounded"></div>
            <div className="h-4 w-1/2 bg-muted rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !snippet) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <Card className="w-full text-center py-10">
          <CardHeader>
            <CardTitle>Code Snippet Not Found</CardTitle>
            <CardDescription>
              {error || "The code snippet you're looking for doesn't exist or has been removed."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/" className={buttonVariants({ variant: "default" })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{snippet.title}</CardTitle>
              <CardDescription className="mt-1">
                {snippet.description}
              </CardDescription>
            </div>
            
            {/* Smart complexity indicator */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    complexityColors[snippet.complexity - 1]
                  )}>
                    {complexityLabels[snippet.complexity - 1]}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Code complexity level: {snippet.complexity}/5</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{snippet.user.username}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(snippet.createdAt)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{snippet.views} views</span>
            </div>
            
            {/* Emoji-based code mood */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                    <span className="text-lg">{moodEmoticons[snippet.mood]?.emoji || '😐'}</span>
                    <span>{snippet.mood}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{moodEmoticons[snippet.mood]?.description || 'Neutral feeling about this code'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex items-center gap-1">
              {snippet.isPublic ? (
                <>
                  <Globe className="h-4 w-4" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Private</span>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowRaw(!showRaw)}
            >
              {showRaw ? 'Show Animated' : 'Show Raw Code'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadCode}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyShareLink}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            
            <Button
              variant={hasLiked ? "default" : "outline"}
              size="sm"
              onClick={toggleLike}
              className={hasLiked ? "bg-pink-500 hover:bg-pink-600" : ""}
            >
              <Heart className={cn("h-4 w-4 mr-2", hasLiked ? "fill-current" : "")} />
              {likeCount} Likes
            </Button>
          </div>
          
          {/* Code display area */}
          {showRaw ? (
            <pre className="p-4 bg-gray-900 text-gray-100 rounded-md font-mono text-sm overflow-x-auto">
              <code>{snippet.code}</code>
            </pre>
          ) : (
            <AnimatedCodeGeneration
              code={snippet.code}
              language={snippet.language}
              autoPlay={true}
              initialSpeed={10}
            />
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <a 
            href="/"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </a>
          
          {/* Playground button (will be implemented later) */}
          <Button disabled>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Playground
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}