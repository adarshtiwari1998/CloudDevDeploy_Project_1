import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "xterm/css/xterm.css";
import { Maximize2, Minimize2 } from "lucide-react";

interface TerminalTab {
  id: string;
  name: string;
}

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [activeTab, setActiveTab] = useState<string>("terminal");
  const [tabs] = useState<TerminalTab[]>([
    { id: "terminal", name: "TERMINAL" },
    { id: "problems", name: "PROBLEMS" },
    { id: "output", name: "OUTPUT" },
    { id: "debug", name: "DEBUG CONSOLE" }
  ]);
  const [maximized, setMaximized] = useState(false);
  
  useEffect(() => {
    if (!terminalRef.current) return;
    
    if (!xtermRef.current) {
      // Initialize xterm.js
      const term = new XTerm({
        cursorBlink: true,
        fontFamily: "'Fira Code', monospace",
        fontSize: 14,
        theme: {
          background: '#121212',
          foreground: '#f0f0f0',
          cursor: '#f0f0f0',
          black: '#121212',
          brightBlack: '#666666',
          red: '#ff5555',
          brightRed: '#ff6e6e',
          green: '#50fa7b',
          brightGreen: '#69ff94',
          yellow: '#f1fa8c',
          brightYellow: '#ffffa5',
          blue: '#0e9ce9',
          brightBlue: '#38b7f8',
          magenta: '#ff79c6',
          brightMagenta: '#ff92df',
          cyan: '#8be9fd',
          brightCyan: '#a4ffff',
          white: '#f8f8f2',
          brightWhite: '#ffffff'
        }
      });
      
      // Create and attach fit addon
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      
      // Render terminal
      term.open(terminalRef.current);
      fitAddon.fit();
      
      // Store references
      xtermRef.current = term;
      fitAddonRef.current = fitAddon;
      
      // Welcome message
      term.writeln('\x1b[1;34mWelcome to Azure CloudIDE Terminal\x1b[0m');
      term.writeln('Type commands to interact with your development environment');
      term.writeln('');
      term.write('$ ');
      
      // Handle user input
      term.onKey(({ key, domEvent }) => {
        const isEnter = domEvent.key === 'Enter';
        
        if (isEnter) {
          term.writeln('');
          term.write('$ ');
        } else {
          term.write(key);
        }
      });
      
      // Handle window resize
      const handleResize = () => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        term.dispose();
      };
    } else {
      // Terminal already initialized, just fit it
      if (fitAddonRef.current) {
        setTimeout(() => {
          fitAddonRef.current?.fit();
        }, 10);
      }
    }
  }, []);

  useEffect(() => {
    // Fit terminal when it's shown
    if (activeTab === "terminal" && fitAddonRef.current) {
      setTimeout(() => {
        fitAddonRef.current?.fit();
      }, 10);
    }
  }, [activeTab]);
  
  const toggleMaximize = () => {
    setMaximized(prev => !prev);
    
    // Refit the terminal after resize
    setTimeout(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    }, 100);
  };

  return (
    <div className={`flex flex-col h-full ${maximized ? 'absolute inset-0 z-50 bg-background' : ''}`}>
      <div className="flex justify-between items-center px-3 py-1 border-b border-border bg-muted text-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent p-0 h-auto">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-2 py-0.5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={toggleMaximize}
        >
          {maximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {activeTab === "terminal" && (
          <div ref={terminalRef} className="h-full w-full" />
        )}
        
        {activeTab === "problems" && (
          <div className="p-3">
            <p className="text-sm text-muted-foreground">No problems have been detected in the workspace.</p>
          </div>
        )}
        
        {activeTab === "output" && (
          <div className="p-3">
            <p className="text-sm text-muted-foreground">No output to display.</p>
          </div>
        )}
        
        {activeTab === "debug" && (
          <div className="p-3">
            <p className="text-sm text-muted-foreground">No active debug session.</p>
          </div>
        )}
      </div>
    </div>
  );
}
