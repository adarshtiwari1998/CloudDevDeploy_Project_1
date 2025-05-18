import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from './ui/card';
import { 
  Form, FormControl, FormDescription, 
  FormField, FormItem, FormLabel, FormMessage 
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { 
  Share2, Copy, Link, Globe, Lock, EyeOff, 
  Calendar, Code2, Sparkles, AtSign
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Language options
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'dart', label: 'Dart' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'xml', label: 'XML' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'shell', label: 'Shell/Bash' },
];

// Mood options for emoji-based code mood tracker
const MOODS = [
  { value: 'happy', label: '😊 Happy', description: 'Clean, well-structured code' },
  { value: 'proud', label: '🚀 Proud', description: 'Elegant solution, optimized' },
  { value: 'neutral', label: '😐 Neutral', description: 'Gets the job done' },
  { value: 'tired', label: '😫 Tired', description: 'Works but needs refactoring' },
  { value: 'confused', label: '🤔 Confused', description: 'Not sure if this is right' },
  { value: 'frustrated', label: '😤 Frustrated', description: 'Complex problem to solve' },
  { value: 'experimental', label: '🧪 Experimental', description: 'Just trying something new' },
];

// Form schema for code sharing
const codeShareFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  code: z.string().min(1, {
    message: "Code snippet cannot be empty.",
  }),
  language: z.string({
    required_error: "Please select a language.",
  }),
  vanityUrl: z.string().min(3, {
    message: "Vanity URL must be at least 3 characters.",
  }).regex(/^[a-zA-Z0-9-_]+$/, {
    message: "Vanity URL can only contain letters, numbers, hyphens, and underscores.",
  }).optional(),
  complexity: z.preprocess(
    (val) => Number(val),
    z.number().min(1).max(5)
  ),
  mood: z.string({
    required_error: "Please select a mood.",
  }),
  isPublic: z.boolean().default(true),
  expiresAt: z.string().optional(),
});

type CodeShareFormValues = z.infer<typeof codeShareFormSchema>;

/**
 * Code Sharing Component
 * 
 * This component allows users to share code snippets with custom vanity URLs
 * and includes features like complexity indicators and mood trackers.
 */
export default function CodeSharing() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  const [complexity, setComplexity] = useState(1);
  
  // Initialize form
  const form = useForm<CodeShareFormValues>({
    resolver: zodResolver(codeShareFormSchema),
    defaultValues: {
      title: '',
      description: '',
      code: '',
      language: 'javascript',
      vanityUrl: '',
      complexity: 1,
      mood: 'neutral',
      isPublic: true,
      expiresAt: '',
    },
  });
  
  // Generate a random vanity URL
  const generateVanityUrl = () => {
    const random = nanoid(8);
    form.setValue('vanityUrl', random);
  };
  
  // Handle form submission
  const onSubmit = async (values: CodeShareFormValues) => {
    try {
      setIsSubmitting(true);
      
      // If no vanity URL is provided, generate one
      if (!values.vanityUrl) {
        values.vanityUrl = nanoid(8);
      }
      
      // TODO: Send data to server
      console.log("Sharing code snippet:", values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set shared URL (in a real app, this would come from the server)
      const baseUrl = window.location.origin;
      setSharedUrl(`${baseUrl}/s/${values.vanityUrl}`);
      
      toast({
        title: "Code shared successfully!",
        description: "Your code snippet is now available with a custom URL.",
      });
    } catch (error) {
      toast({
        title: "Failed to share code",
        description: "There was an error sharing your code snippet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle copying shared URL to clipboard
  const copyToClipboard = () => {
    if (sharedUrl) {
      navigator.clipboard.writeText(sharedUrl);
      toast({
        title: "URL copied to clipboard!",
        description: "You can now paste and share it anywhere.",
      });
    }
  };
  
  // Get complexity color based on value (1-5)
  const getComplexityColor = (value: number) => {
    const colors = [
      'bg-green-500', // Very simple (1)
      'bg-green-300', // Simple (2)
      'bg-yellow-300', // Moderate (3)
      'bg-orange-400', // Complex (4)
      'bg-red-500',    // Very complex (5)
    ];
    return colors[value - 1] || colors[0];
  };
  
  // Get complexity label
  const getComplexityLabel = (value: number) => {
    const labels = [
      'Very Simple',
      'Simple',
      'Moderate',
      'Complex',
      'Very Complex',
    ];
    return labels[value - 1] || labels[0];
  };
  
  // Update complexity state when form value changes
  const handleComplexityChange = (value: number) => {
    setComplexity(value);
    form.setValue('complexity', value);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          One-Click Code Sharing
        </CardTitle>
        <CardDescription>
          Share your code with a custom vanity URL and track its complexity and mood.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {sharedUrl ? (
          <div className="p-4 bg-muted rounded-md">
            <h3 className="text-lg font-semibold mb-2">Your code has been shared!</h3>
            <div className="flex items-center gap-2 mb-4">
              <Input 
                value={sharedUrl} 
                readOnly
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="default"
                onClick={() => setSharedUrl(null)}
              >
                Share Another Snippet
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open(sharedUrl, '_blank')}
              >
                View Snippet
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="My awesome code snippet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LANGUAGES.map((language) => (
                            <SelectItem key={language.value} value={language.value}>
                              {language.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A brief description of what this code does..." 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code Snippet</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Paste your code here..." 
                        className="font-mono h-40 resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vanityUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom URL</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                              {window.location.origin}/s/
                            </span>
                            <Input 
                              className="rounded-l-none"
                              placeholder="my-awesome-code" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={generateVanityUrl}
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormDescription>
                        Generate a random identifier or create your own custom URL.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Code Mood <span className="text-sm text-muted-foreground">(How do you feel about this code?)</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a mood" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOODS.map((mood) => (
                            <SelectItem key={mood.value} value={mood.value}>
                              <div className="flex flex-col">
                                <span>{mood.label}</span>
                                <span className="text-xs text-muted-foreground">{mood.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormLabel>Code Complexity</FormLabel>
                  <div className="flex items-center mt-2">
                    <span
                      className={`inline-block w-4 h-4 rounded-full mr-2 ${getComplexityColor(complexity)}`}
                    ></span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`inline-block h-full rounded-full ${
                            value <= complexity ? getComplexityColor(value) : 'bg-transparent'
                          }`}
                          style={{ width: '20%' }}
                          onClick={() => handleComplexityChange(value)}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm">{getComplexityLabel(complexity)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center gap-4">
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <FormLabel>Public</FormLabel>
                          <FormDescription>
                            <span className="flex items-center gap-1">
                              {field.value ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                              {field.value ? 'Anyone with the link can view' : 'Only you can view'}
                            </span>
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Creating Share Link...</>
                  ) : (
                    <>
                      <Link className="mr-2 h-4 w-4" /> 
                      Generate Shareable Link
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}