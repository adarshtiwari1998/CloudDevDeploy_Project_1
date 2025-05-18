import * as monaco from "monaco-editor";

// Define supported languages and their file extensions
export const SUPPORTED_LANGUAGES = {
  javascript: [".js"],
  typescript: [".ts", ".tsx"],
  html: [".html", ".htm"],
  css: [".css"],
  json: [".json"],
  python: [".py"],
  markdown: [".md"],
  plaintext: [".txt"],
};

// Get language from file extension
export const getLanguageForFile = (fileName: string): string => {
  const extension = fileName.substring(fileName.lastIndexOf("."));
  
  for (const [language, extensions] of Object.entries(SUPPORTED_LANGUAGES)) {
    if (extensions.includes(extension)) {
      return language;
    }
  }
  
  return "plaintext";
};

// Common editor options
export const getEditorDefaultOptions = (): monaco.editor.IStandaloneEditorConstructionOptions => {
  return {
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    lineNumbers: "on",
    tabSize: 2,
    fontSize: 14,
    fontFamily: "'Fira Code', monospace",
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    theme: "vs-dark",
  };
};

// Register themes
export const registerEditorThemes = () => {
  monaco.editor.defineTheme("azure-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6a9955" },
      { token: "keyword", foreground: "569cd6" },
      { token: "string", foreground: "ce9178" },
      { token: "number", foreground: "b5cea8" },
      { token: "function", foreground: "dcdcaa" },
      { token: "variable", foreground: "9cdcfe" },
      { token: "type", foreground: "4ec9b0" },
    ],
    colors: {
      "editor.background": "#1e1e1e",
      "editor.foreground": "#d4d4d4",
      "editor.lineHighlightBackground": "#2d2d2d",
      "editorCursor.foreground": "#d4d4d4",
      "editorWhitespace.foreground": "#3e3e3e",
    },
  });

  monaco.editor.defineTheme("azure-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "008000" },
      { token: "keyword", foreground: "0000ff" },
      { token: "string", foreground: "a31515" },
      { token: "number", foreground: "098658" },
      { token: "function", foreground: "795e26" },
      { token: "variable", foreground: "001080" },
      { token: "type", foreground: "267f99" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#000000",
      "editor.lineHighlightBackground": "#f3f3f3",
      "editorCursor.foreground": "#000000",
      "editorWhitespace.foreground": "#d4d4d4",
    },
  });
};

// Sample template files for new projects
export const getTemplateFile = (language: string, fileName: string): string => {
  switch (language) {
    case "javascript":
      return `// ${fileName}
console.log('Hello from JavaScript!');

function greet(name) {
  return \`Hello, \${name}!\`;
}

// Example usage
const greeting = greet('World');
console.log(greeting);
`;
    
    case "typescript":
      return `// ${fileName}
interface Person {
  name: string;
  age: number;
}

function greet(person: Person): string {
  return \`Hello, \${person.name}! You are \${person.age} years old.\`;
}

// Example usage
const person: Person = {
  name: 'World',
  age: 25
};

console.log(greet(person));
`;

    case "python":
      return `# ${fileName}
def greet(name):
    return f"Hello, {name}!"

# Example usage
if __name__ == "__main__":
    greeting = greet("World")
    print(greeting)
`;

    case "html":
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Web Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #0e9ce9;
    }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Welcome to my web page created in Azure CloudIDE.</p>
  
  <script>
    console.log('Page loaded successfully!');
  </script>
</body>
</html>
`;

    case "react":
      return `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  
  const handleIncrement = () => {
    setCount(prevCount => prevCount + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>You clicked {count} times</p>
        <button onClick={handleIncrement}>
          Click me
        </button>
      </header>
    </div>
  );
}

export default App;
`;

    default:
      return `// ${fileName}\n\n`;
  }
};
