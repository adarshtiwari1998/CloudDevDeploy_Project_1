import { useEffect } from "react";
import Header from "@/components/header";
import FileExplorer from "@/components/file-explorer";
import Editor from "@/components/editor";
import Terminal from "@/components/terminal";
import AiAssistant from "@/components/ai-assistant";
import { useResize } from "@/hooks/use-resize";
import { useDispatch } from "react-redux";
import { loadInitialState } from "@/store/editor-slice";

export default function Home() {
  const dispatch = useDispatch();
  const { 
    fileExplorerRef, 
    fileExplorerResizeRef, 
    aiAssistantRef, 
    aiAssistantResizeRef,
    terminalRef,
    terminalResizeRef
  } = useResize();

  useEffect(() => {
    // Initialize the editor state
    dispatch(loadInitialState());
  }, [dispatch]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        <div ref={fileExplorerRef} className="w-52 bg-sidebar border-r border-border">
          <FileExplorer />
        </div>
        
        {/* Resize Handle */}
        <div ref={fileExplorerResizeRef} className="resize-handle" />
        
        {/* Main Editor & Terminal Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Editor */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Editor />
            </div>
            
            {/* AI Assistant Resize Handle */}
            <div ref={aiAssistantResizeRef} className="resize-handle" />
            
            {/* AI Assistant */}
            <div ref={aiAssistantRef} className="w-64 border-l border-border bg-sidebar">
              <AiAssistant />
            </div>
          </div>
          
          {/* Terminal Resize Handle */}
          <div ref={terminalResizeRef} className="resize-handle-horizontal" />
          
          {/* Terminal */}
          <div ref={terminalRef} className="h-48 border-t border-border">
            <Terminal />
          </div>
        </div>
      </div>
    </div>
  );
}
