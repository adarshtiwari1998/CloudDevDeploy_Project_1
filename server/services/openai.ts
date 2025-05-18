/**
 * OpenAI integration service
 * Provides functions for AI-powered code generation, completion, explanation, and debugging
 */

import OpenAI from "openai";

// Initialize OpenAI client
// Note: In a production environment, API key would be stored in environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-default-key-for-development"
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Generate AI chat response for the AI assistant
 */
export async function aiGenerateChatResponse(message: string, context: string = ""): Promise<string> {
  try {
    console.log(`Generating AI chat response for message: ${message.substring(0, 50)}...`);
    
    const initialPrompt = context 
      ? `Consider the following code context:\n\n${context}\n\nNow, respond to this question or request: ${message}`
      : message;
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an AI coding assistant integrated into a cloud IDE. Provide helpful, clear, and concise responses about code, programming concepts, and development best practices. When asked to explain code, show examples where appropriate. When giving coding advice, consider the user's current context if provided.",
        },
        {
          role: "user",
          content: initialPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });
    
    return response.choices[0].message.content || 
      "I'm sorry, I couldn't generate a response at this time.";
    
  } catch (error) {
    console.error("Error generating AI chat response:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Generate code based on a prompt
 */
export async function aiGenerateCode(prompt: string, language: string, context: string = ""): Promise<string> {
  try {
    console.log(`Generating ${language} code for prompt: ${prompt.substring(0, 50)}...`);
    
    const initialPrompt = context 
      ? `Consider the following code context:\n\n${context}\n\nNow, generate ${language} code that accomplishes: ${prompt}`
      : `Generate ${language} code that accomplishes: ${prompt}`;
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert ${language} programmer. Generate clean, well-documented, production-ready code based on the user's requirements. Include comments to explain your implementation where necessary. Only respond with code (and comments within the code). Do not include any explanations outside of the code block.`,
        },
        {
          role: "user",
          content: initialPrompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });
    
    const generatedCode = response.choices[0].message.content || "";
    
    // Strip code block markers if they exist
    return generatedCode.replace(/```[\w]*\n|```$/g, "").trim();
    
  } catch (error) {
    console.error("Error generating code:", error);
    throw new Error("Failed to generate code");
  }
}

/**
 * Generate context-aware code based on project structure and existing code
 */
export async function aiGenerateContextAwareCode(
  prompt: string, 
  language: string, 
  codeContext: {
    currentFile?: { name: string; content: string; };
    selectedCode?: string;
    projectStructure?: { name: string; type: string; }[];
    relatedFiles?: { name: string; content: string; }[];
  }
): Promise<{ code: string; explanation: string }> {
  try {
    console.log(`Generating context-aware ${language} code for prompt: ${prompt.substring(0, 50)}...`);
    
    // Build detailed context from the provided information
    let contextDescription = "";
    
    if (codeContext.currentFile) {
      contextDescription += `CURRENT FILE (${codeContext.currentFile.name}):\n${codeContext.currentFile.content}\n\n`;
    }
    
    if (codeContext.selectedCode) {
      contextDescription += `SELECTED CODE:\n${codeContext.selectedCode}\n\n`;
    }
    
    if (codeContext.projectStructure && codeContext.projectStructure.length > 0) {
      contextDescription += "PROJECT STRUCTURE:\n";
      codeContext.projectStructure.forEach(item => {
        contextDescription += `- ${item.name} (${item.type})\n`;
      });
      contextDescription += "\n";
    }
    
    if (codeContext.relatedFiles && codeContext.relatedFiles.length > 0) {
      codeContext.relatedFiles.forEach(file => {
        contextDescription += `RELATED FILE (${file.name}):\n${file.content}\n\n`;
      });
    }
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert ${language} programmer in a cloud IDE environment. You help generate context-aware code based on the user's request and their project context.
          
Your response should have TWO parts, clearly separated:
1. The generated code (clean, well-documented, production-ready)
2. A brief explanation of how this code works with the existing project

Consider the project structure, coding style, and patterns in existing files when generating code.`,
        },
        {
          role: "user",
          content: `I need help with the following in my ${language} project:\n\n${prompt}\n\nHere's the context from my project:\n\n${contextDescription}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    const result = response.choices[0].message.content || "";
    
    // Extract code and explanation
    let code = "";
    let explanation = "";
    
    // Look for code blocks
    const codeBlockMatch = result.match(/```[\w]*\n([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      code = codeBlockMatch[1].trim();
      
      // Get explanation (everything after the code block)
      const afterCodeBlock = result.substring(result.lastIndexOf("```") + 3).trim();
      explanation = afterCodeBlock || "Here is the code based on your project context.";
    } else {
      // No code block formatting, try to intelligently extract code vs. explanation
      const lines = result.split("\n");
      const codeLines = [];
      const explanationLines = [];
      
      let inExplanation = false;
      for (const line of lines) {
        // Detect transitions between code and explanation
        if (line.toLowerCase().includes("explanation:") || 
            line.toLowerCase().includes("here's how") ||
            line.toLowerCase().includes("how this works")) {
          inExplanation = true;
        }
        
        if (inExplanation) {
          explanationLines.push(line);
        } else {
          codeLines.push(line);
        }
      }
      
      code = codeLines.join("\n").trim();
      explanation = explanationLines.join("\n").trim();
      
      // If we couldn't separate them, just return everything as code
      if (!explanation) {
        code = result;
        explanation = "Here is the code based on your project context.";
      }
    }
    
    return { code, explanation };
    
  } catch (error) {
    console.error("Error generating context-aware code:", error);
    throw new Error("Failed to generate context-aware code");
  }
}

/**
 * Provide code completion suggestions
 */
export async function aiCompleteSuggestions(
  code: string, 
  position: { lineNumber: number; column: number },
  language: string
): Promise<Array<{ text: string; description: string }>> {
  try {
    console.log(`Generating code completion suggestions for ${language} at line ${position.lineNumber}, column ${position.column}`);
    
    // Split code into lines
    const lines = code.split("\n");
    
    // Get the current line up to the cursor position
    const currentLine = position.lineNumber <= lines.length 
      ? lines[position.lineNumber - 1].slice(0, position.column) 
      : "";
    
    // Create context with a few lines before and after the current line
    const startLine = Math.max(0, position.lineNumber - 6);
    const endLine = Math.min(lines.length, position.lineNumber + 5);
    const codeContext = lines.slice(startLine, endLine).join("\n");
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a code completion AI assisting with ${language} programming. Provide 3-5 completion suggestions for the current code position. Each suggestion should be relevant, syntactically correct, and contextually appropriate. Response must be in JSON format with an array of objects containing 'text' (the completion text) and 'description' (a brief explanation).`,
        },
        {
          role: "user",
          content: `Code context:\n\`\`\`${language}\n${codeContext}\n\`\`\`\n\nCurrent position is at line ${position.lineNumber}, column ${position.column}, which is after the text: "${currentLine}"\n\nProvide completion suggestions in JSON format.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1000,
    });
    
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return Array.isArray(result.suggestions) ? result.suggestions : [];
    
  } catch (error) {
    console.error("Error generating code completion suggestions:", error);
    return []; // Return empty array on error
  }
}

/**
 * Explain code
 */
export async function aiExplainCode(code: string, language: string = ""): Promise<string> {
  try {
    console.log(`Explaining code: ${code.substring(0, 50)}...`);
    
    const languagePrompt = language ? `This is ${language} code:` : "This code:";
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert programming tutor. Explain code in a clear, concise, and educational manner. Break down the explanation into logical sections and highlight important concepts.",
        },
        {
          role: "user",
          content: `${languagePrompt}\n\`\`\`\n${code}\n\`\`\`\n\nPlease explain what this code does, how it works, and point out any notable patterns, best practices, or potential issues.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });
    
    return response.choices[0].message.content || 
      "I'm sorry, I couldn't generate an explanation at this time.";
    
  } catch (error) {
    console.error("Error explaining code:", error);
    throw new Error("Failed to explain code");
  }
}

/**
 * Debug code and provide solutions
 */
export async function aiDebugCode(code: string, error: string, language: string = ""): Promise<string> {
  try {
    console.log(`Debugging ${language} code with error: ${error.substring(0, 50)}...`);
    
    const languagePrompt = language ? `This is ${language} code:` : "This code:";
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert debugging assistant. Analyze code and error messages, then provide clear explanations of the problem and suggested fixes. Include corrected code snippets where appropriate.",
        },
        {
          role: "user",
          content: `${languagePrompt}\n\`\`\`\n${code}\n\`\`\`\n\nI'm getting this error:\n\`\`\`\n${error}\n\`\`\`\n\nPlease explain what's causing the error and how to fix it.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });
    
    return response.choices[0].message.content || 
      "I'm sorry, I couldn't debug this code at this time.";
    
  } catch (error) {
    console.error("Error debugging code:", error);
    throw new Error("Failed to debug code");
  }
}
