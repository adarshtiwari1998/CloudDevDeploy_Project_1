import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { getTemplateFile } from "@/lib/editor-utils";

export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: FileItem[];
}

export interface OpenFile {
  id: string;
  name: string;
  content: string;
  language?: string;
  active: boolean;
}

interface EditorState {
  files: FileItem[];
  openFiles: OpenFile[];
}

const initialState: EditorState = {
  files: [],
  openFiles: [],
};

// Sample project structure with example files
const sampleProjectStructure: FileItem[] = [
  {
    id: "root",
    name: "my-react-app",
    type: "folder",
    children: [
      {
        id: "src",
        name: "src",
        type: "folder",
        children: [
          {
            id: "app-js",
            name: "App.js",
            type: "file",
            language: "javascript",
            content: getTemplateFile("react", "App.js"),
          },
          {
            id: "app-css",
            name: "App.css",
            type: "file",
            language: "css",
            content: `/* App.css */
.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

button {
  background-color: #0e9ce9;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
}

button:hover {
  background-color: #0284c7;
}`,
          },
          {
            id: "index-js",
            name: "index.js",
            type: "file",
            language: "javascript",
            content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
          },
        ],
      },
      {
        id: "package-json",
        name: "package.json",
        type: "file",
        language: "json",
        content: `{
  "name": "my-react-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,
      },
      {
        id: "readme-md",
        name: "README.md",
        type: "file",
        language: "markdown",
        content: `# My React App

This is a simple React application created with Azure CloudIDE.

## Available Scripts

In the project directory, you can run:

### \`npm start\`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### \`npm run build\`

Builds the app for production to the \`build\` folder.`,
      },
    ],
  },
];

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    loadInitialState: (state) => {
      state.files = sampleProjectStructure;
    },
    
    setFiles: (state, action: PayloadAction<FileItem[]>) => {
      state.files = action.payload;
    },
    
    openFile: (state, action: PayloadAction<FileItem>) => {
      const file = action.payload;
      
      // Check if file is already open
      const existingFileIndex = state.openFiles.findIndex(
        (f) => f.id === file.id
      );
      
      // First, set all files to inactive
      state.openFiles = state.openFiles.map((f) => ({
        ...f,
        active: false,
      }));
      
      if (existingFileIndex !== -1) {
        // If file is already open, just set it to active
        state.openFiles[existingFileIndex].active = true;
      } else if (file.type === "file" && file.content) {
        // Add new file to openFiles
        state.openFiles.push({
          id: file.id,
          name: file.name,
          content: file.content,
          language: file.language,
          active: true,
        });
      }
    },
    
    closeFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      const fileIndex = state.openFiles.findIndex((f) => f.id === fileId);
      
      if (fileIndex === -1) return;
      
      // Remove file
      state.openFiles.splice(fileIndex, 1);
      
      // If the closed file was active, activate another file
      if (state.openFiles.length > 0 && state.openFiles[fileIndex]?.active) {
        // Try to activate the file at the same index, or the last file
        const nextActiveIndex = Math.min(fileIndex, state.openFiles.length - 1);
        state.openFiles[nextActiveIndex].active = true;
      }
    },
    
    setActiveFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      
      state.openFiles = state.openFiles.map((file) => ({
        ...file,
        active: file.id === fileId,
      }));
    },
    
    updateFileContent: (
      state,
      action: PayloadAction<{ id: string; content: string }>
    ) => {
      const { id, content } = action.payload;
      
      // Update in openFiles
      const openFileIndex = state.openFiles.findIndex((f) => f.id === id);
      if (openFileIndex !== -1) {
        state.openFiles[openFileIndex].content = content;
      }
      
      // Update in files (recursively)
      const updateFileContentInTree = (items: FileItem[]): boolean => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          if (item.id === id && item.type === "file") {
            item.content = content;
            return true;
          }
          
          if (item.children && updateFileContentInTree(item.children)) {
            return true;
          }
        }
        
        return false;
      };
      
      updateFileContentInTree(state.files);
    },
  },
});

export const {
  loadInitialState,
  setFiles,
  openFile,
  closeFile,
  setActiveFile,
  updateFileContent,
} = editorSlice.actions;

// Selectors
export const selectFiles = (state: RootState) => state.editor.files;
export const selectOpenFiles = (state: RootState) => state.editor.openFiles;
export const selectActiveFile = (state: RootState) =>
  state.editor.openFiles.find((file) => file.active);

export default editorSlice.reducer;
