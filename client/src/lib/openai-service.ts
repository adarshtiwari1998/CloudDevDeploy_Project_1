import { apiRequest } from "./queryClient";

// Send a message to the AI service
export const sendMessageToAI = async (message: string, context: string = ""): Promise<string> => {
  try {
    const response = await apiRequest('POST', '/api/ai/message', {
      message,
      context
    });
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending message to AI:', error);
    throw error;
  }
};

// Get code generation from AI
export const generateCode = async (
  prompt: string,
  language: string,
  context: string = ""
): Promise<string> => {
  try {
    const response = await apiRequest('POST', '/api/ai/generate-code', {
      prompt,
      language,
      context
    });
    
    const data = await response.json();
    return data.code;
  } catch (error) {
    console.error('Error generating code with AI:', error);
    throw error;
  }
};

// Get code explanation from AI
export const explainCode = async (code: string, language: string): Promise<string> => {
  try {
    const response = await apiRequest('POST', '/api/ai/explain-code', {
      code,
      language
    });
    
    const data = await response.json();
    return data.explanation;
  } catch (error) {
    console.error('Error explaining code with AI:', error);
    throw error;
  }
};

// AI debugging assistance
export const debugCode = async (
  code: string,
  error: string,
  language: string
): Promise<string> => {
  try {
    const response = await apiRequest('POST', '/api/ai/debug', {
      code,
      error,
      language
    });
    
    const data = await response.json();
    return data.solution;
  } catch (error) {
    console.error('Error debugging code with AI:', error);
    throw error;
  }
};

// Get AI code completion suggestions
export const getCompletionSuggestions = async (
  code: string, 
  position: { lineNumber: number; column: number },
  language: string
): Promise<Array<{ text: string; description: string }>> => {
  try {
    const response = await apiRequest('POST', '/api/ai/completion', {
      code,
      position,
      language
    });
    
    const data = await response.json();
    return data.suggestions;
  } catch (error) {
    console.error('Error getting AI code completion:', error);
    throw [];
  }
};

// Types for context-aware code generation
interface CodeContext {
  currentFile?: { name: string; content: string };
  selectedCode?: string;
  projectStructure?: { name: string; type: string }[];
  relatedFiles?: { name: string; content: string }[];
}

interface ContextAwareCodeResult {
  code: string;
  explanation: string;
}

// Generate context-aware code with project awareness
export const generateContextAwareCode = async (
  prompt: string,
  language: string,
  codeContext: CodeContext
): Promise<ContextAwareCodeResult> => {
  try {
    const response = await apiRequest('POST', '/api/ai/context-aware-code', {
      prompt,
      language,
      codeContext
    });
    
    const data = await response.json();
    return {
      code: data.code || "",
      explanation: data.explanation || ""
    };
  } catch (error) {
    console.error('Error generating context-aware code:', error);
    throw error;
  }
};
