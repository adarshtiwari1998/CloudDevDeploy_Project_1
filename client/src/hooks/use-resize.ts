import { useRef, useEffect } from 'react';

export const useResize = () => {
  const fileExplorerRef = useRef<HTMLDivElement>(null);
  const fileExplorerResizeRef = useRef<HTMLDivElement>(null);
  const aiAssistantRef = useRef<HTMLDivElement>(null);
  const aiAssistantResizeRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalResizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fileExplorer = fileExplorerRef.current;
    const fileExplorerResizer = fileExplorerResizeRef.current;
    const aiAssistant = aiAssistantRef.current;
    const aiAssistantResizer = aiAssistantResizeRef.current;
    const terminal = terminalRef.current;
    const terminalResizer = terminalResizeRef.current;
    
    if (!fileExplorer || !fileExplorerResizer || !aiAssistant || !aiAssistantResizer || !terminal || !terminalResizer) {
      return;
    }
    
    let isResizing = false;
    let currentResizer: HTMLDivElement | null = null;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    
    const startResize = (e: MouseEvent, resizer: HTMLDivElement) => {
      e.preventDefault();
      isResizing = true;
      currentResizer = resizer;
      
      if (resizer === fileExplorerResizer) {
        startX = e.clientX;
        startWidth = fileExplorer.offsetWidth;
      } else if (resizer === aiAssistantResizer) {
        startX = e.clientX;
        startWidth = aiAssistant.offsetWidth;
      } else if (resizer === terminalResizer) {
        startY = e.clientY;
        startHeight = terminal.offsetHeight;
      }
      
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
      
      // Add active class
      resizer.classList.add('bg-primary');
    };
    
    const resize = (e: MouseEvent) => {
      if (!isResizing || !currentResizer) return;
      
      if (currentResizer === fileExplorerResizer) {
        const newWidth = startWidth + (e.clientX - startX);
        
        // Set min and max widths
        if (newWidth >= 150 && newWidth <= 500) {
          fileExplorer.style.width = `${newWidth}px`;
        }
      } else if (currentResizer === aiAssistantResizer) {
        const newWidth = startWidth - (e.clientX - startX);
        
        // Set min and max widths
        if (newWidth >= 200 && newWidth <= 600) {
          aiAssistant.style.width = `${newWidth}px`;
        }
      } else if (currentResizer === terminalResizer) {
        const newHeight = startHeight - (e.clientY - startY);
        
        // Set min and max heights
        if (newHeight >= 100 && newHeight <= window.innerHeight / 2) {
          terminal.style.height = `${newHeight}px`;
        }
      }
    };
    
    const stopResize = () => {
      isResizing = false;
      
      if (currentResizer) {
        currentResizer.classList.remove('bg-primary');
        currentResizer = null;
      }
      
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
    };
    
    // Add event listeners
    fileExplorerResizer.addEventListener('mousedown', (e) => startResize(e, fileExplorerResizer));
    aiAssistantResizer.addEventListener('mousedown', (e) => startResize(e, aiAssistantResizer));
    terminalResizer.addEventListener('mousedown', (e) => startResize(e, terminalResizer));
    
    // Cleanup
    return () => {
      fileExplorerResizer.removeEventListener('mousedown', (e) => startResize(e, fileExplorerResizer));
      aiAssistantResizer.removeEventListener('mousedown', (e) => startResize(e, aiAssistantResizer));
      terminalResizer.removeEventListener('mousedown', (e) => startResize(e, terminalResizer));
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
    };
  }, []);
  
  return {
    fileExplorerRef,
    fileExplorerResizeRef,
    aiAssistantRef,
    aiAssistantResizeRef,
    terminalRef,
    terminalResizeRef
  };
};
