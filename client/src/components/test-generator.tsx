import React, { useState } from 'react';
import { generateCode } from '../lib/openai-service';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2, TestTube2, CheckCircle2 } from 'lucide-react';
import { AnimatedCodeGeneration } from './animated-code-generation';

/**
 * Automated Unit Test Generator Component
 * 
 * This component allows users to paste code and get AI-generated 
 * unit tests for their code.
 */
export default function TestGenerator() {
  // State
  const [code, setCode] = useState('');
  const [framework, setFramework] = useState('jest');
  const [language, setLanguage] = useState('typescript');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTests, setGeneratedTests] = useState('');
  const [error, setError] = useState('');

  // Test frameworks by language
  const testFrameworks = {
    javascript: [
      { value: 'jest', label: 'Jest' },
      { value: 'mocha', label: 'Mocha + Chai' },
      { value: 'jasmine', label: 'Jasmine' }
    ],
    typescript: [
      { value: 'jest', label: 'Jest' },
      { value: 'mocha', label: 'Mocha + Chai' },
      { value: 'jasmine', label: 'Jasmine' }
    ],
    python: [
      { value: 'pytest', label: 'pytest' },
      { value: 'unittest', label: 'unittest' }
    ],
    java: [
      { value: 'junit', label: 'JUnit' },
      { value: 'testng', label: 'TestNG' }
    ]
  };

  // Programming languages
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' }
  ];

  // Handle code input change
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  // Handle language selection
  const handleLanguageSelect = (value: string) => {
    setLanguage(value);
    // Reset framework if not available for the selected language
    const availableFrameworks = testFrameworks[value as keyof typeof testFrameworks] || [];
    if (!availableFrameworks.find(f => f.value === framework)) {
      setFramework(availableFrameworks[0]?.value || '');
    }
  };

  // Handle framework selection
  const handleFrameworkSelect = (value: string) => {
    setFramework(value);
  };

  // Generate tests for the code
  const handleGenerateTests = async () => {
    if (!code.trim()) {
      setError('Please enter some code to generate tests for.');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      setGeneratedTests('');

      // Prepare the prompt for the AI
      const prompt = `Generate ${framework} unit tests for the following ${language} code. Include all necessary imports, mocks, and test setup. Make sure the tests are comprehensive and cover edge cases:\n\n${code}`;
      
      // Call the API to generate tests
      const result = await generateCode(prompt, language);
      
      setGeneratedTests(result);
    } catch (err: any) {
      console.error('Error generating tests:', err);
      setError(err.message || 'Failed to generate tests. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl">
          <TestTube2 className="h-5 w-5" />
          Automated Unit Test Generator
        </CardTitle>
        <CardDescription className="text-gray-200">
          Generate comprehensive unit tests for your code
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {/* Code Input */}
        <div className="space-y-2">
          <Label htmlFor="test-code" className="text-sm font-medium">
            Paste your code to test
          </Label>
          <Textarea
            id="test-code"
            placeholder="Paste your code here to generate unit tests..."
            value={code}
            onChange={handleCodeChange}
            className="min-h-[200px] font-mono text-sm resize-y"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="test-language" className="text-sm font-medium">
              Programming Language
            </Label>
            <Select value={language} onValueChange={handleLanguageSelect}>
              <SelectTrigger id="test-language" className="w-full">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Framework Selection */}
          <div className="space-y-2">
            <Label htmlFor="test-framework" className="text-sm font-medium">
              Testing Framework
            </Label>
            <Select value={framework} onValueChange={handleFrameworkSelect}>
              <SelectTrigger id="test-framework" className="w-full">
                <SelectValue placeholder="Select a framework" />
              </SelectTrigger>
              <SelectContent>
                {testFrameworks[language as keyof typeof testFrameworks]?.map((fw) => (
                  <SelectItem key={fw.value} value={fw.value}>
                    {fw.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col space-y-4">
        {/* Generate Button */}
        <Button 
          onClick={handleGenerateTests} 
          disabled={isGenerating || !code.trim()} 
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Tests...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Generate Unit Tests
            </>
          )}
        </Button>
        
        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
        
        {/* Generated Tests Result */}
        {generatedTests && (
          <div className="w-full mt-4">
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
                <h3 className="text-base font-medium mb-2">Generated Unit Tests:</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                  <code>{generatedTests}</code>
                </pre>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedTests);
                    alert('Tests copied to clipboard!');
                  }}
                  className="mt-4"
                >
                  Copy to Clipboard
                </Button>
              </TabsContent>
              
              <TabsContent value="animated">
                <h3 className="text-base font-medium mb-2 flex items-center">
                  <TestTube2 className="h-4 w-4 mr-2 text-primary" />
                  Watch Test Generation:
                </h3>
                <AnimatedCodeGeneration 
                  code={generatedTests} 
                  language={language}
                  initialSpeed={7}
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedTests);
                    alert('Tests copied to clipboard!');
                  }}
                  className="mt-4"
                >
                  Copy to Clipboard
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}