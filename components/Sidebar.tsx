
import React from 'react';
import { ProjectFile } from '../types';

interface SidebarProps {
  files: ProjectFile[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ files, selectedId, onSelect }) => {
  const rootFiles = files.filter(f => !f.parentId);
  
  const renderFile = (file: ProjectFile, depth = 0) => {
    const children = files.filter(f => f.parentId === file.id);
    const isSelected = selectedId === file.id;

    return (
      <div key={file.id}>
        <div 
          onClick={() => onSelect(file.id)}
          className={`flex items-center space-x-2 p-1.5 px-3 cursor-pointer transition-all group ${
            isSelected ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'hover:bg-slate-800/40'
          }`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          <span className={`material-icons-round text-sm ${isSelected ? 'text-primary' : 'text-slate-600'}`}>
            {file.type === 'folder' ? 'folder' : 'description'}
          </span>
          <span className={`text-[11px] font-semibold tracking-tight ${isSelected ? 'text-slate-100' : 'text-slate-500 group-hover:text-slate-300'}`}>
            {file.name}
          </span>
        </div>
        {children.length > 0 && (
          <div>
            {children.map(child => renderFile(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-56 border-r border-border bg-surface flex flex-col shrink-0 h-full overflow-hidden">
      <div className="p-3 border-b border-border/50 bg-background/30 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Project Files</span>
        <button className="text-slate-500 hover:text-primary transition-colors">
          <span className="material-icons-round text-sm">add</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {rootFiles.map(file => renderFile(file))}
      </div>
    </aside>
  );
};

export default Sidebar;
