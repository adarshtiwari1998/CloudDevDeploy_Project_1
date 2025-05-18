import { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUp } from "lucide-react";
import { useSelector } from "react-redux";
import { selectActiveFile } from "@/store/editor-slice";
import { sendMessageToAI } from "@/lib/openai-service";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function AiAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'How can I help you with your code today?',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const activeFile = useSelector(selectActiveFile);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Get context from active file
      const context = activeFile 
        ? `Current file: ${activeFile.name}\n\n${activeFile.content}`
        : "No file is currently open.";
      
      // Try to send message to AI if OpenAI API key is set
      let response;
      try {
        // Send message to AI
        response = await sendMessageToAI(input, context);
      } catch (error) {
        console.error("AI service error:", error);
        response = "I'm having trouble connecting to the OpenAI service. This could be due to an API key issue or network problem. I can still help with basic IDE functionality, though!";
      }
      
      // Add AI response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      
      // Focus input after response
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const formatCode = (content: string) => {
    // Simple regex-based code block formatter
    return content.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre class="bg-muted p-2 rounded text-xs overflow-x-auto my-2">${code}</pre>`;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 font-medium text-sm border-b border-border">
        AI ASSISTANT
      </div>
      
      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`p-2 rounded shadow-sm ${
                message.role === 'user' 
                  ? 'bg-primary/10 ml-4' 
                  : 'bg-background mr-4'
              }`}
            >
              <div className="text-xs text-muted-foreground mb-1">
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </div>
              <div 
                className="text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: formatCode(message.content) 
                }}
              />
            </div>
          ))}
          
          {isLoading && (
            <div className="p-2 bg-background rounded shadow-sm mr-4">
              <div className="text-xs text-muted-foreground mb-1">
                AI Assistant
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <Separator />
      
      <form onSubmit={handleSubmit} className="p-3">
        <div className="relative">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Assistant..."
            className="pr-10"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
