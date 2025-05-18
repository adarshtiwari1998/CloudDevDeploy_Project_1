import React, { useState } from 'react';
import { explainCode } from '../lib/openai-service';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Loader2, Code, FileText } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../lib/editor-utils';

/**
 * Code Explanation Component
 * 
 * This component allows users to paste code and get an AI-powered explanation
 * of what the code does, along with generated documentation.
 */
export default function CodeExplanation() {
  // State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'explain' | 'document'>('explain');

  // Handle code input change
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  // Handle language selection
  const handleLanguageSelect = (value: string) => {
    setLanguage(value);
  };

  // Explain or document the code
  const handleExplainCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to explain.');
      return;
    }

    try {
      setIsExplaining(true);
      setError('');
      setExplanation('');

      // Call the API to explain the code
      const result = await explainCode(code, language);
      
      setExplanation(result);
    } catch (err: any) {
      console.error('Error explaining code:', err);
      setError(err.message || 'Failed to explain the code. Please try again.');
    } finally {
      setIsExplaining(false);
    }
  };

  // Toggle between explanation and documentation modes
  const toggleMode = () => {
    setMode(mode === 'explain' ? 'document' : 'explain');
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl">
          {mode === 'explain' ? (
            <>
              <Code className="h-5 w-5" />
              Code Explanation
            </>
          ) : (
            <>
              <FileText className="h-5 w-5" />
              Documentation Generator
            </>
          )}
        </CardTitle>
        <CardDescription className="text-gray-200">
          {mode === 'explain' 
            ? 'Get a clear explanation of what your code does' 
            : 'Generate professional documentation for your code'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {/* Code Input */}
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-medium">
            Paste your code below
          </Label>
          <Textarea
            id="code"
            placeholder="Paste your code here..."
            value={code}
            onChange={handleCodeChange}
            className="min-h-[200px] font-mono text-sm resize-y"
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
        
        {/* Mode Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Mode</Label>
          <div className="flex border rounded-md overflow-hidden">
            <Button
              type="button"
              variant={mode === 'explain' ? 'default' : 'outline'}
              onClick={() => setMode('explain')}
              className="rounded-none border-0"
            >
              Explain Code
            </Button>
            <Button
              type="button"
              variant={mode === 'document' ? 'default' : 'outline'}
              onClick={() => setMode('document')}
              className="rounded-none border-0 border-l"
            >
              Generate Docs
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col space-y-4">
        {/* Generate Button */}
        <Button 
          onClick={handleExplainCode} 
          disabled={isExplaining || !code.trim()} 
          className="w-full"
        >
          {isExplaining ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'explain' ? 'Analyzing Code...' : 'Generating Documentation...'}
            </>
          ) : (
            mode === 'explain' ? 'Explain Code' : 'Generate Documentation'
          )}
        </Button>
        
        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
        
        {/* Explanation Result */}
        {explanation && (
          <div className="w-full mt-4 border rounded-md p-4 bg-muted/20">
            <h3 className="text-base font-medium mb-2">
              {mode === 'explain' ? 'Code Explanation:' : 'Generated Documentation:'}
            </h3>
            <div className="prose prose-sm max-w-none">
              {explanation.split('\n').map((line, i) => (
                <p key={i} className="my-1">{line}</p>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}