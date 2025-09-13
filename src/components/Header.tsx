import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, User, Settings, HelpCircle, FolderOpen, Save, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onOpenProject?: () => void;
  onSaveProject?: () => void;
  onExportProject?: () => void;
  onOpenSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onOpenProject,
  onSaveProject,
  onExportProject,
  onOpenSettings
}) => {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">3D</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">3DGen Desktop</span>
            <div className="text-xs text-gray-500">Professional 3D Model Generator</div>
          </div>
        </div>
        
        <nav className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <FolderOpen className="w-4 h-4 mr-2" />
                File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={onOpenProject}>
                <FolderOpen className="w-4 h-4 mr-2" />
                Open Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSaveProject}>
                <Save className="w-4 h-4 mr-2" />
                Save Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExportProject}>
                <Download className="w-4 h-4 mr-2" />
                Export Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            View
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            Tools
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            Help
          </Button>
        </nav>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <HelpCircle className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-600 hover:text-gray-900"
          onClick={onOpenSettings}
        >
          <Settings className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 relative">
          <Bell className="w-5 h-5" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;