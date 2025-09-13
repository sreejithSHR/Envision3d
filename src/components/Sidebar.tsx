import React from 'react';
import { cn } from '@/lib/utils';
import { Upload, List, Settings, History, FolderOpen } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: 'upload', icon: Upload, label: 'Generate' },
    { id: 'queue', icon: List, label: 'Queue' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'files', icon: FolderOpen, label: 'Files' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4">
      <div className="mb-8">
        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-bold text-black">
          3D
        </div>
      </div>
      
      <div className="flex flex-col gap-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center transition-colors group relative",
                activeView === item.id
                  ? "bg-yellow-500 text-black"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
              title={item.label}
            >
              <Icon size={20} />
              <span className="absolute left-16 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;