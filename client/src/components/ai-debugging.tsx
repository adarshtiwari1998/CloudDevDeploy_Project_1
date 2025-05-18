import React, { useState } from 'react';
import { debugCode } from '../lib/openai-service';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2, Bug, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../lib/editor-utils';
import { AnimatedCodeGeneration } from './animated-code-generation';

/**
 * AI-Powered Debugging Component
 * 
 * This component allows users to paste code with errors and get AI-powered
 * suggestions on how to fix them.
 */
export default function AiDebugging() {
  // State
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [isDebugging, setIsDebugging] = useState(false);
  const [solution, setSolution] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle code input change
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  // Handle error input change
  const handleErrorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setError(e.target.value);
  };

  // Handle language selection
  const handleLanguageSelect = (value: string) => {
    setLanguage(value);
  };

  // Debug the code
  const handleDebugCode = async () => {
    if (!code.trim()) {
      setErrorMessage('Please enter some code to debug.');
      return;
    }

    try {
      setIsDebugging(true);
      setErrorMessage('');
      setSolution('');

      // Call the API to debug the code
      const result = await debugCode(code, error, language);
      
      setSolution(result);
    } catch (err: any) {
      console.error('Error debugging code:', err);
      setErrorMessage(err.message || 'Failed to debug the code. Please try again.');
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Bug className="h-5 w-5" />
          AI-Powered Debugging
        </CardTitle>
        <CardDescription className="text-gray-200">
          Get intelligent solutions for your code errors
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {/* Code Input */}
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-medium">
            Paste your code with bugs
          </Label>
          <Textarea
            id="code"
            placeholder="Paste your problematic code here..."
            value={code}
            onChange={handleCodeChange}
            className="min-h-[200px] font-mono text-sm resize-y"
          />
        </div>
        
        {/* Error Message Input */}
        <div className="space-y-2">
          <Label htmlFor="error" className="text-sm font-medium">
            Error message or problem description (optional)
          </Label>
          <Textarea
            id="error"
            placeholder="E.g., TypeError: Cannot read property 'length' of undefined OR Describe the issue: 'The function is supposed to sort the array but it's not working correctly'"
            value={error}
            onChange={handleErrorChange}
            className="h-[80px] resize-y"
          />
        </div>
        
        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language" className="text-sm font-medium">
            Programming Language
          </Label>
          <Select value={language} onValueChange={handleLanguageSelect}>
            <SelectTrigger id="language" className="w-full">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SUPPORTED_LANGUAGES).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col space-y-4">
        {/* Debug Button */}
        <Button 
          onClick={handleDebugCode} 
          disabled={isDebugging || !code.trim()} 
          className="w-full"
        >
          {isDebugging ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Code...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Debug Code
            </>
          )}
        </Button>
        
        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
        )}
        
        {/* Solution Result */}
        {solution && (
          <div className="w-full mt-4 border rounded-md p-4 bg-muted/20">
            <Tabs defaultValue="text">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="text" className="flex-1">
                  Text Solution
                </TabsTrigger>
                <TabsTrigger value="animated" className="flex-1">
                  Animated Solution
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text">
                <h3 className="text-base font-medium mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  Debugging Solution:
                </h3>
                
                <div className="prose prose-sm max-w-none">
                  {solution.split('\n').map((line, i) => (
                    <p key={i} className="my-1">{line}</p>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="animated">
                <h3 className="text-base font-medium mb-2 flex items-center">
                  <Bug className="h-4 w-4 mr-2 text-primary" />
                  Watch the Solution Unfold:
                </h3>
                
                <AnimatedCodeGeneration 
                  code={solution} 
                  language="markdown" 
                  initialSpeed={10}
                  className="p-0 mb-4"
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}