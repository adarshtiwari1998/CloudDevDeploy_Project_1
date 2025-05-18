import { useCallback } from "react";
import * as monaco from "monaco-editor";
import { getLanguageForFile, getEditorDefaultOptions, registerEditorThemes } from "@/lib/editor-utils";
import { useTheme } from "next-themes";

// Initialize the editor themes
registerEditorThemes();

export interface FileData {
  id: string;
  name: string;
  content: string;
  language?: string;
}

export const useEditorSetup = () => {
  const { theme } = useTheme();

  const setupEditor = useCallback((element: HTMLElement, file: FileData) => {
    // Determine language from file extension
    const language = file.language || getLanguageForFile(file.name);
    
    // Get default options
    const options = getEditorDefaultOptions();
    
    // Set theme based on system preference
    options.theme = theme === 'dark' ? 'azure-dark' : 'azure-light';
    
    // Create editor
    const editor = monaco.editor.create(element, {
      ...options,
      value: file.content,
      language,
    });
    
    return editor;
  }, [theme]);

  return { setupEditor };
};
