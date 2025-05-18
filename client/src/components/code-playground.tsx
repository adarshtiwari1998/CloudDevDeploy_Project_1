import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Play, Save, Download, Share2, Plus, Trash, 
  Code, FileCode, Info, Monitor, Settings, PanelRight,
  Loader2, Expand, Copy, ExternalLink, PanelLeftClose,
  PanelRightClose, TerminalSquare
} from 'lucide-react';

// Language options with associated file extensions and editor language mode
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', extension: 'js', mode: 'javascript' },
  { value: 'typescript', label: 'TypeScript', extension: 'ts', mode: 'typescript' },
  { value: 'html', label: 'HTML', extension: 'html', mode: 'html' },
  { value: 'css', label: 'CSS', extension: 'css', mode: 'css' },
  { value: 'python', label: 'Python', extension: 'py', mode: 'python' },
  { value: 'java', label: 'Java', extension: 'java', mode: 'java' },
  { value: 'csharp', label: 'C#', extension: 'cs', mode: 'csharp' },
  { value: 'php', label: 'PHP', extension: 'php', mode: 'php' },
  { value: 'ruby', label: 'Ruby', extension: 'rb', mode: 'ruby' },
  { value: 'go', label: 'Go', extension: 'go', mode: 'go' },
  { value: 'json', label: 'JSON', extension: 'json', mode: 'json' },
  { value: 'markdown', label: 'Markdown', extension: 'md', mode: 'markdown' },
];

// Template types
const TEMPLATES = [
  { id: 'empty', name: 'Empty Project' },
  { id: 'react-basic', name: 'React Starter' },
  { id: 'node-express', name: 'Express API' },
  { id: 'vanilla-js', name: 'Vanilla JS' },
  { id: 'python-flask', name: 'Python Flask' },
];

interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  active?: boolean;
}

interface PlaygroundProps {
  initialCode?: string;
  initialLanguage?: string;
  initialFiles?: CodeFile[];
  onSave?: (files: CodeFile[]) => void;
  onShare?: (files: CodeFile[]) => void;
}

/**
 * Interactive Code Playground Component
 * 
 * This component allows users to write and run code in multiple languages
 * with a live preview of the results.
 */
export default function CodePlayground({
  initialCode = '',
  initialLanguage = 'javascript',
  initialFiles,
  onSave,
  onShare,
}: PlaygroundProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'output'>('code');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const [files, setFiles] = useState<CodeFile[]>(initialFiles || [
    {
      id: '1',
      name: 'index.html',
      language: 'html',
      content: '<html>\n  <head>\n    <title>Playground</title>\n    <link rel="stylesheet" href="styles.css">\n  </head>\n  <body>\n    <div id="app"></div>\n    <script src="main.js"></script>\n  </body>\n</html>',
      active: true
    },
    {
      id: '2',
      name: 'styles.css',
      language: 'css',
      content: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background-color: #f4f4f4;\n}\n\n#app {\n  background-color: white;\n  border-radius: 8px;\n  padding: 20px;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n}',
    },
    {
      id: '3',
      name: 'main.js',
      language: 'javascript',
      content: initialCode || '// Welcome to the Code Playground\nconst app = document.getElementById("app");\n\n// Create a heading element\nconst heading = document.createElement("h1");\nheading.textContent = "Interactive Code Playground";\napp.appendChild(heading);\n\n// Create a paragraph element\nconst paragraph = document.createElement("p");\nparagraph.textContent = "Edit the files and click Run to see the results!";\napp.appendChild(paragraph);\n\n// Add a button that does something\nconst button = document.createElement("button");\nbutton.textContent = "Click Me";\nbutton.addEventListener("click", () => {\n  alert("Button clicked!");\n});\napp.appendChild(button);',
    },
  ]);

  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  
  // Get the active file
  const activeFile = files.find(file => file.active) || files[0];
  
  // Set a file as active
  const setActiveFile = (fileId: string) => {
    setFiles(files.map(file => ({
      ...file,
      active: file.id === fileId
    })));
  };
  
  // Update a file's content
  const updateFileContent = (fileId: string, content: string) => {
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, content } : file
    ));
  };
  
  // Add a new file
  const addNewFile = () => {
    // Generate a unique ID
    const newId = String(Date.now());
    
    // Create default name based on language
    const newFile: CodeFile = {
      id: newId,
      name: `new-file-${files.length + 1}.js`,
      language: 'javascript',
      content: '// Add your code here',
      active: true
    };
    
    // Add the new file and set it as active
    setFiles([
      ...files.map(file => ({ ...file, active: false })),
      newFile
    ]);
  };
  
  // Delete a file
  const deleteFile = (fileId: string) => {
    // Don't allow deleting if there's only one file
    if (files.length <= 1) {
      toast({
        title: "Cannot delete file",
        description: "You need at least one file in the playground.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if trying to delete the active file
    const isActive = files.find(f => f.id === fileId)?.active;
    
    // Remove the file
    const updatedFiles = files.filter(file => file.id !== fileId);
    
    // If deleting the active file, set another file as active
    if (isActive && updatedFiles.length > 0) {
      updatedFiles[0].active = true;
    }
    
    setFiles(updatedFiles);
  };
  
  // Rename a file (would be implemented with a modal in a real app)
  const renameFile = (fileId: string, newName: string) => {
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, name: newName } : file
    ));
  };
  
  // Change a file's language
  const changeFileLanguage = (fileId: string, language: string) => {
    setFiles(files.map(file => {
      if (file.id === fileId) {
        // Get the file extension for this language
        const langInfo = LANGUAGES.find(l => l.value === language);
        const extension = langInfo?.extension || 'txt';
        
        // Update the file name extension if needed
        const baseName = file.name.split('.')[0];
        const newName = `${baseName}.${extension}`;
        
        return { ...file, language, name: newName };
      }
      return file;
    }));
  };
  
  // Run the code
  const runCode = () => {
    setIsRunning(true);
    setShowOutput(true);
    
    try {
      // In a real application, this would send the files to a server for execution
      // or use a client-side sandbox like CodeSandbox or JSFiddle
      
      // For demonstration, we'll assemble the HTML/CSS/JS for preview
      const htmlFile = files.find(file => file.name.endsWith('.html'));
      const cssFiles = files.filter(file => file.name.endsWith('.css'));
      const jsFiles = files.filter(file => file.name.endsWith('.js'));
      
      let htmlContent = htmlFile?.content || '';
      
      // If no HTML file is present, create a basic one
      if (!htmlFile) {
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Playground</title>
  <style>
    ${cssFiles.map(file => file.content).join('\n')}
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    ${jsFiles.map(file => file.content).join('\n')}
  </script>
</body>
</html>`;
      }
      
      // Update the preview iframe
      if (previewIframeRef.current) {
        const iframe = previewIframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(htmlContent);
          iframeDoc.close();
          
          // Capture console logs from the iframe
          const originalConsoleLog = iframe.contentWindow?.console.log;
          const originalConsoleError = iframe.contentWindow?.console.error;
          const originalConsoleWarn = iframe.contentWindow?.console.warn;
          
          if (iframe.contentWindow) {
            iframe.contentWindow.console.log = (...args) => {
              setOutput(prev => prev + '\n' + args.join(' '));
              originalConsoleLog?.apply(iframe.contentWindow?.console, args);
            };
            
            iframe.contentWindow.console.error = (...args) => {
              setOutput(prev => prev + '\n[ERROR] ' + args.join(' '));
              originalConsoleError?.apply(iframe.contentWindow?.console, args);
            };
            
            iframe.contentWindow.console.warn = (...args) => {
              setOutput(prev => prev + '\n[WARNING] ' + args.join(' '));
              originalConsoleWarn?.apply(iframe.contentWindow?.console, args);
            };
          }
        }
      }
      
      // For simplicity, we'll also set some example output
      setOutput('> Code execution started\n> Running playground...\n> HTML/CSS/JS rendered in preview pane');
      
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
      // Switch to preview tab after running
      setActiveTab('preview');
    }
  };
  
  // Save the code
  const handleSave = () => {
    if (onSave) {
      onSave(files);
    } else {
      toast({
        title: "Project Saved",
        description: "Your code playground has been saved."
      });
    }
  };
  
  // Share the code
  const handleShare = () => {
    if (onShare) {
      onShare(files);
    } else {
      // In a real app, this would generate a shareable link
      toast({
        title: "Share Link Generated",
        description: "The link has been copied to your clipboard."
      });
    }
  };
  
  // Download the code as a zip file
  const handleDownload = () => {
    // In a real app, this would generate a zip file with all the project files
    toast({
      title: "Download Started",
      description: "Your project files are being prepared for download."
    });
  };
  
  // Simple Monaco editor stub (would be replaced with actual Monaco in a real app)
  const MonacoEditor = ({ 
    content, 
    language, 
    onChange 
  }: { 
    content: string, 
    language: string, 
    onChange: (value: string) => void 
  }) => {
    return (
      <div className="w-full h-full min-h-[400px] bg-gray-900 text-gray-100 rounded-md overflow-hidden">
        <div className="p-2 bg-gray-800 text-xs text-gray-400">
          {language.toUpperCase()} Editor
        </div>
        <textarea
          className="w-full h-[calc(100%-30px)] p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none outline-none"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      </div>
    );
  };
  
  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  // Copy code to clipboard
  const copyCode = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      toast({
        title: "Code Copied",
        description: `${activeFile.name} copied to clipboard.`
      });
    }
  };
  
  return (
    <div className={cn(
      "w-full h-full border rounded-md overflow-hidden transition-all",
      isFullScreen ? "fixed inset-0 z-50 rounded-none" : "relative"
    )}>
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="px-4 py-2 bg-muted flex items-center justify-between border-b">
          <div className="flex items-center">
            <Code className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-sm font-medium">Interactive Code Playground</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={runCode} 
              disabled={isRunning}
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-1" />
              )}
              Run
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={toggleFullScreen}
            >
              <Expand className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-1 h-[calc(100%-48px)] overflow-hidden">
          {/* File Explorer Sidebar */}
          {showSidebar && (
            <div className="w-64 bg-muted border-r flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <h4 className="text-sm font-medium">Files</h4>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={addNewFile}
                  className="h-7 w-7"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <ul className="p-2 space-y-1">
                  {files.map((file) => (
                    <li 
                      key={file.id}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer",
                        file.active ? "bg-primary/10 text-primary" : "hover:bg-muted-foreground/10"
                      )}
                      onClick={() => setActiveFile(file.id)}
                    >
                      <FileCode className="h-4 w-4 shrink-0" />
                      <span className="truncate flex-1">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.id);
                        }}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-2 border-t">
                <Select
                  value="templates"
                  onValueChange={(value) => {
                    // In a real app, this would load a template
                    toast({
                      title: "Template Selected",
                      description: `Loading ${value} template...`
                    });
                  }}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select Template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="templates" disabled>Templates</SelectItem>
                    {TEMPLATES.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {/* Editor/Preview Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Switcher */}
            <div className="p-2 bg-muted border-b flex items-center justify-between">
              <Tabs 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as 'code' | 'preview' | 'output')}
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="code" className="text-xs">
                      <Code className="h-3.5 w-3.5 mr-1" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs">
                      <Monitor className="h-3.5 w-3.5 mr-1" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="output" className="text-xs">
                      <TerminalSquare className="h-3.5 w-3.5 mr-1" />
                      Console
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2">
                    {activeTab === 'code' && activeFile && (
                      <>
                        <Select
                          value={activeFile.language}
                          onValueChange={(value) => changeFileLanguage(activeFile.id, value)}
                        >
                          <SelectTrigger className="h-7 text-xs w-32">
                            <SelectValue placeholder="Language" />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map(lang => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 px-2" 
                          onClick={copyCode}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7" 
                      onClick={toggleSidebar}
                    >
                      {showSidebar ? (
                        <PanelLeftClose className="h-3.5 w-3.5" />
                      ) : (
                        <PanelRightClose className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </Tabs>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="code" className="h-full">
                {activeFile && (
                  <MonacoEditor
                    content={activeFile.content}
                    language={activeFile.language}
                    onChange={(value) => updateFileContent(activeFile.id, value)}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="preview" className="h-full">
                <div className="w-full h-full bg-white">
                  <iframe
                    ref={previewIframeRef}
                    title="Code Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="output" className="h-full">
                <pre className="h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm overflow-auto">
                  {output || "Run your code to see output here..."}
                </pre>
              </TabsContent>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}