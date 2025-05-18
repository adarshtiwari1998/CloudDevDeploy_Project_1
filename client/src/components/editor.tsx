import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { useSelector, useDispatch } from "react-redux";
import { 
  selectOpenFiles, 
  updateFileContent, 
  closeFile, 
  setActiveFile 
} from "@/store/editor-slice";
import { useEditorSetup } from "@/hooks/use-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";

export default function Editor() {
  const dispatch = useDispatch();
  const openFiles = useSelector(selectOpenFiles);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorInstances = useRef<{[key: string]: monaco.editor.IStandaloneCodeEditor}>({});
  
  const { setupEditor } = useEditorSetup();

  // Find the active file
  const activeFile = openFiles.find(file => file.active);
  const activeFileId = activeFile?.id || '';

  useEffect(() => {
    if (!editorContainerRef.current) return;
    
    // Cleanup function to dispose editors
    return () => {
      Object.values(editorInstances.current).forEach(editor => {
        editor.dispose();
      });
      editorInstances.current = {};
    };
  }, []);

  useEffect(() => {
    if (!editorContainerRef.current || !activeFile) return;
    
    // Create editor instance for each file that doesn't have one yet
    openFiles.forEach((file) => {
      const editorElementId = `editor-${file.id}`;
      const editorElement = document.getElementById(editorElementId);
      
      if (editorElement && !editorInstances.current[file.id]) {
        const editor = setupEditor(editorElement, file);
        
        // Set up model change listener
        editor.onDidChangeModelContent(() => {
          const value = editor.getValue();
          dispatch(updateFileContent({ id: file.id, content: value }));
        });
        
        editorInstances.current[file.id] = editor;
      }
    });
    
  }, [openFiles, activeFile, setupEditor, dispatch]);

  const handleCloseFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    
    // Dispose editor instance
    if (editorInstances.current[fileId]) {
      editorInstances.current[fileId].dispose();
      delete editorInstances.current[fileId];
    }
    
    dispatch(closeFile(fileId));
  };

  const handleTabChange = (value: string) => {
    dispatch(setActiveFile(value));
  };

  return (
    <div className="flex flex-col h-full">
      {openFiles.length > 0 ? (
        <Tabs 
          value={activeFileId} 
          onValueChange={handleTabChange}
          className="h-full flex flex-col"
        >
          <TabsList className="flex items-center h-9 overflow-x-auto bg-muted border-b border-border rounded-none justify-start">
            {openFiles.map((file) => (
              <TabsTrigger 
                key={file.id} 
                value={file.id}
                className="px-3 py-1 h-full data-[state=active]:bg-background flex items-center gap-1 border-r border-border"
              >
                <span className="text-sm truncate max-w-[120px]">{file.name}</span>
                <button
                  onClick={(e) => handleCloseFile(e, file.id)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="flex-1 relative" ref={editorContainerRef}>
            {openFiles.map((file) => (
              <TabsContent
                key={file.id}
                value={file.id}
                className="h-full mt-0 absolute inset-0"
              >
                <div id={`editor-${file.id}`} className="h-full w-full"></div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No Files Open</h3>
            <p className="text-sm text-muted-foreground">
              Select a file from the explorer to start editing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
