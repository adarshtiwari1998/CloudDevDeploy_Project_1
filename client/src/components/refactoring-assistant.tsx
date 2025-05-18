import React, { useState } from 'react';
import { generateCode } from '../lib/openai-service';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2, Wand2, Code2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../lib/editor-utils';
import { AnimatedCodeGeneration } from './animated-code-generation';

/**
 * Refactoring Assistant Component
 * 
 * This component helps users refactor their code for improved quality,
 * readability, performance, or maintainability.
 */
export default function RefactoringAssistant() {
  // State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [refactoringType, setRefactoringType] = useState('readability');
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [refactoredCode, setRefactoredCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  // Refactoring types
  const refactoringTypes = [
    { value: 'readability', label: 'Improve Readability' },
    { value: 'performance', label: 'Optimize Performance' },
    { value: 'maintainability', label: 'Enhance Maintainability' },
    { value: 'modernize', label: 'Modernize Code Style' },
    { value: 'patterns', label: 'Apply Design Patterns' }
  ];

  // Handle code input change
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  // Handle language selection
  const handleLanguageSelect = (value: string) => {
    setLanguage(value);
  };

  // Handle refactoring type selection
  const handleRefactoringTypeSelect = (value: string) => {
    setRefactoringType(value);
  };

  // Refactor the code
  const handleRefactorCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to refactor.');
      return;
    }

    try {
      setIsRefactoring(true);
      setError('');
      setRefactoredCode('');
      setExplanation('');

      // Create a descriptive prompt based on the refactoring type
      let refactoringGoal = '';
      switch (refactoringType) {
        case 'readability':
          refactoringGoal = 'Improve code readability by using clearer variable names, adding helpful comments, and breaking down complex expressions or functions';
          break;
        case 'performance':
          refactoringGoal = 'Optimize code performance by identifying and fixing inefficient algorithms, reducing redundant calculations, and improving data structures';
          break;
        case 'maintainability':
          refactoringGoal = 'Enhance code maintainability by applying SOLID principles, reducing duplication, and improving the overall structure';
          break;
        case 'modernize':
          refactoringGoal = 'Modernize the code by using the latest language features and best practices';
          break;
        case 'patterns':
          refactoringGoal = 'Apply appropriate design patterns to improve the code architecture';
          break;
        default:
          refactoringGoal = 'Improve code quality overall';
      }

      const prompt = `Refactor the following ${language} code to ${refactoringGoal}. 
      
Original code:
\`\`\`
${code}
\`\`\`

Provide both the refactored code and a clear explanation of the changes made and why they improve the code quality. Format the response as follows:

REFACTORED CODE:
<the refactored code>

EXPLANATION:
<explanation of changes>`;

      // Call the API to refactor code
      const result = await generateCode(prompt, language);
      
      // Parse the result to extract code and explanation
      const parseResult = (text: string) => {
        const codeMatch = text.match(/REFACTORED CODE:\s*\n([\s\S]*?)(?=\n\s*EXPLANATION:|$)/i);
        const explanationMatch = text.match(/EXPLANATION:\s*\n([\s\S]*?)$/i);
        
        return {
          code: codeMatch ? codeMatch[1].trim() : text,
          explanation: explanationMatch ? explanationMatch[1].trim() : ''
        };
      };
      
      const { code: parsedCode, explanation: parsedExplanation } = parseResult(result);
      
      setRefactoredCode(parsedCode);
      setExplanation(parsedExplanation || 'The code has been refactored to improve quality.');
    } catch (err: any) {
      console.error('Error refactoring code:', err);
      setError(err.message || 'Failed to refactor the code. Please try again.');
    } finally {
      setIsRefactoring(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Wand2 className="h-5 w-5" />
          Refactoring Assistant
        </CardTitle>
        <CardDescription className="text-gray-200">
          Transform your code for better quality, performance, and maintainability
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {/* Code Input */}
        <div className="space-y-2">
          <Label htmlFor="refactor-code" className="text-sm font-medium">
            Paste your code to refactor
          </Label>
          <Textarea
            id="refactor-code"
            placeholder="Paste your code here to refactor..."
            value={code}
            onChange={handleCodeChange}
            className="min-h-[200px] font-mono text-sm resize-y"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="refactor-language" className="text-sm font-medium">
              Programming Language
            </Label>
            <Select value={language} onValueChange={handleLanguageSelect}>
              <SelectTrigger id="refactor-language" className="w-full">
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
          
          {/* Refactoring Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="refactoring-type" className="text-sm font-medium">
              Refactoring Goal
            </Label>
            <Select value={refactoringType} onValueChange={handleRefactoringTypeSelect}>
              <SelectTrigger id="refactoring-type" className="w-full">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                {refactoringTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col space-y-4">
        {/* Refactor Button */}
        <Button 
          onClick={handleRefactorCode} 
          disabled={isRefactoring || !code.trim()} 
          className="w-full"
        >
          {isRefactoring ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refactoring Code...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Refactor Code
            </>
          )}
        </Button>
        
        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
        
        {/* Refactored Code Result */}
        {refactoredCode && (
          <div className="w-full mt-4 space-y-4">
            <Tabs defaultValue="standard">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="standard" className="flex-1">
                  Standard View
                </TabsTrigger>
                <TabsTrigger value="animated" className="flex-1">
                  Animated View
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="standard">
                <div>
                  <h3 className="text-base font-medium mb-2 flex items-center">
                    <Code2 className="h-4 w-4 mr-2 text-primary" />
                    Refactored Code:
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                    <code>{refactoredCode}</code>
                  </pre>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigator.clipboard.writeText(refactoredCode);
                      alert('Code copied to clipboard!');
                    }}
                    className="mt-2"
                    size="sm"
                  >
                    Copy Code
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="animated">
                <h3 className="text-base font-medium mb-2 flex items-center">
                  <Wand2 className="h-4 w-4 mr-2 text-primary" />
                  Watch the Refactoring:
                </h3>
                <AnimatedCodeGeneration 
                  code={refactoredCode} 
                  language={language}
                  initialSpeed={8}
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(refactoredCode);
                    alert('Code copied to clipboard!');
                  }}
                  className="mt-2"
                  size="sm"
                >
                  Copy Code
                </Button>
              </TabsContent>
            </Tabs>
            
            {explanation && (
              <div className="border rounded-md p-4 bg-muted/20">
                <h3 className="text-base font-medium mb-2">Changes Explained:</h3>
                <div className="prose prose-sm max-w-none">
                  {explanation.split('\n').map((line, i) => (
                    <p key={i} className="my-1">{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}