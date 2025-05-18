import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectFiles, selectOpenFiles } from '../store/editor-slice';
import { generateContextAwareCode } from '../lib/openai-service';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Loader2, CheckIcon, Code2Icon } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../lib/editor-utils';
import { AnimatedCodeGeneration } from './animated-code-generation';

/**
 * Context-Aware Code Generator Component
 * 
 * This component allows users to generate code using AI by providing:
 * 1. A natural language prompt
 * 2. The target programming language
 * 3. Contextual information from the current project
 */
export default function ContextAwareCodeGenerator() {
  // State
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('code');
  const [selectedContextOptions, setSelectedContextOptions] = useState({
    includeCurrentFile: true,
    includeSelectedCode: true,
    includeProjectStructure: true,
    includeRelatedFiles: false,
  });

  // Get files and active file from the store
  const files = useSelector(selectFiles);
  const openFiles = useSelector(selectOpenFiles);
  const activeFile = openFiles.find((file) => file.active);

  // Get selected code (simulated - would come from editor)
  const [selectedCode, setSelectedCode] = useState('');

  // Handle prompt change
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  // Handle language selection
  const handleLanguageSelect = (value: string) => {
    setLanguage(value);
  };

  // Handle context option change
  const handleContextOptionChange = (option: keyof typeof selectedContextOptions) => {
    setSelectedContextOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  // Get project structure
  const getProjectStructure = () => {
    return files.map((file) => ({
      name: file.name,
      type: file.type,
    }));
  };

  // Get related files (simplified - in a real app, this would be more sophisticated)
  const getRelatedFiles = () => {
    // For demo, just return the first 2 open files that aren't the active file
    return openFiles
      .filter((file) => file.id !== activeFile?.id)
      .slice(0, 2)
      .map((file) => ({
        name: file.name,
        content: file.content,
      }));
  };

  // Generate code with context
  const handleGenerateCode = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate code.');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      setGeneratedCode('');
      setExplanation('');

      // Build context object
      const codeContext: any = {};

      if (selectedContextOptions.includeCurrentFile && activeFile) {
        codeContext.currentFile = {
          name: activeFile.name,
          content: activeFile.content,
        };
      }

      if (selectedContextOptions.includeSelectedCode && selectedCode) {
        codeContext.selectedCode = selectedCode;
      }

      if (selectedContextOptions.includeProjectStructure) {
        codeContext.projectStructure = getProjectStructure();
      }

      if (selectedContextOptions.includeRelatedFiles) {
        codeContext.relatedFiles = getRelatedFiles();
      }

      // Call the API
      const result = await generateContextAwareCode(prompt, language, codeContext);
      
      setGeneratedCode(result.code);
      setExplanation(result.explanation);
      setActiveTab('code');
    } catch (err: any) {
      console.error('Error generating code:', err);
      setError(err.message || 'Failed to generate code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Insert code into editor (would be implemented based on your editor integration)
  const handleInsertCode = () => {
    // This would dispatch an action to insert the code at the cursor position
    console.log('Inserting code into editor');
    // Example: dispatch(insertCodeAtCursor(generatedCode));
    // Show success message
    alert('Code inserted successfully!');
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Code2Icon className="h-5 w-5" />
          Context-Aware Code Generation
        </CardTitle>
        <CardDescription className="text-gray-200">
          Generate code that understands your project context
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-sm font-medium">
            What would you like me to generate?
          </Label>
          <Textarea
            id="prompt"
            placeholder="E.g., Create a React component for a user profile that displays name, email, and avatar"
            value={prompt}
            onChange={handlePromptChange}
            className="min-h-[100px] resize-y"
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
        
        {/* Context Options */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="context-options">
            <AccordionTrigger className="text-sm font-medium">
              Context Options
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 p-2 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeCurrentFile"
                    checked={selectedContextOptions.includeCurrentFile}
                    onChange={() => handleContextOptionChange('includeCurrentFile')}
                    className="rounded"
                  />
                  <Label htmlFor="includeCurrentFile" className="cursor-pointer">
                    Include current file
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeSelectedCode"
                    checked={selectedContextOptions.includeSelectedCode}
                    onChange={() => handleContextOptionChange('includeSelectedCode')}
                    className="rounded"
                  />
                  <Label htmlFor="includeSelectedCode" className="cursor-pointer">
                    Include selected code
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeProjectStructure"
                    checked={selectedContextOptions.includeProjectStructure}
                    onChange={() => handleContextOptionChange('includeProjectStructure')}
                    className="rounded"
                  />
                  <Label htmlFor="includeProjectStructure" className="cursor-pointer">
                    Include project structure
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeRelatedFiles"
                    checked={selectedContextOptions.includeRelatedFiles}
                    onChange={() => handleContextOptionChange('includeRelatedFiles')}
                    className="rounded"
                  />
                  <Label htmlFor="includeRelatedFiles" className="cursor-pointer">
                    Include related files
                  </Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Text field for selected code simulation */}
        <div className="space-y-2">
          <Label htmlFor="selectedCode" className="text-sm font-medium">
            Selected Code (for testing)
          </Label>
          <Textarea
            id="selectedCode"
            placeholder="Paste code here to simulate selected text in editor"
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            className="h-[80px] resize-y"
          />
          <p className="text-xs text-gray-500">
            In a real implementation, this would come from the editor selection.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col space-y-4">
        {/* Generate Button */}
        <Button 
          onClick={handleGenerateCode} 
          disabled={isGenerating || !prompt.trim()} 
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Code'
          )}
        </Button>
        
        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
        
        {/* Generated Code Result */}
        {(generatedCode || explanation) && (
          <div className="w-full mt-4 border rounded-md">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="code" className="flex-1">
                  Code
                </TabsTrigger>
                <TabsTrigger value="explanation" className="flex-1">
                  Explanation
                </TabsTrigger>
                <TabsTrigger value="animated" className="flex-1">
                  Animated View
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="code" className="p-4">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                  <code>{generatedCode}</code>
                </pre>
                <Button 
                  onClick={handleInsertCode} 
                  variant="outline" 
                  className="mt-4"
                >
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Insert Code at Cursor
                </Button>
              </TabsContent>
              
              <TabsContent value="explanation" className="p-4">
                <div className="prose prose-sm max-w-none">
                  {explanation.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="animated" className="p-4">
                <AnimatedCodeGeneration 
                  code={generatedCode} 
                  language={language}
                  className="border-none shadow-none"
                />
                <Button 
                  onClick={handleInsertCode} 
                  variant="outline" 
                  className="mt-4"
                >
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Insert Code at Cursor
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}