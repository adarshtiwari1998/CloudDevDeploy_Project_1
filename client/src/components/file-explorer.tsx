import { useState } from "react";
import { 
  Folder, 
  File, 
  ChevronDown, 
  ChevronRight, 
  Plus,
  FileText,
  FileCode,
  FileJson,
  FileImage
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { openFile, selectFiles, selectOpenFiles } from "@/store/editor-slice";

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileItem[];
}

const FileIcon = ({ fileType, className = "h-4 w-4" }: { fileType: string; className?: string }) => {
  switch (fileType) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode className={`${className} text-blue-500`} />;
    case 'json':
      return <FileJson className={`${className} text-yellow-500`} />;
    case 'md':
      return <FileText className={`${className} text-gray-500`} />;
    case 'css':
    case 'scss':
      return <FileCode className={`${className} text-purple-500`} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
      return <FileImage className={`${className} text-green-500`} />;
    default:
      return <File className={className} />;
  }
};

const FileTreeItem = ({ item, level = 0 }: { item: FileItem; level?: number }) => {
  const [isOpen, setIsOpen] = useState(true);
  const openFiles = useSelector(selectOpenFiles);
  const dispatch = useDispatch();
  
  const isActive = openFiles.some(f => f.id === item.id && f.active);
  const fileExtension = item.name.split('.').pop() || '';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleFileClick = () => {
    if (item.type === 'file') {
      dispatch(openFile(item));
    }
  };

  return (
    <div>
      <div 
        className={`flex items-center py-1 px-3 cursor-pointer hover:bg-muted ${isActive ? 'bg-primary/10 dark:bg-primary/20' : ''}`}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
        onClick={item.type === 'folder' ? handleToggle : handleFileClick}
      >
        {item.type === 'folder' ? (
          <>
            <button className="p-0.5 mr-1" onClick={handleToggle}>
              {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
            <Folder className="h-4 w-4 mr-1.5 text-yellow-500" />
          </>
        ) : (
          <>
            <div className="w-4 mr-1"></div>
            <FileIcon fileType={fileExtension} className="h-4 w-4 mr-1.5" />
          </>
        )}
        <span className="text-sm truncate">{item.name}</span>
      </div>
      
      {item.type === 'folder' && isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileExplorer() {
  const files = useSelector(selectFiles);
  
  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 font-medium text-sm flex justify-between items-center border-b border-border">
        <span>EXPLORER</span>
        <button className="p-1 rounded hover:bg-muted">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <div className="overflow-auto flex-1">
        {files.map((item) => (
          <FileTreeItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
