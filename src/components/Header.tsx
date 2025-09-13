import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, User, Settings, HelpCircle } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">3D</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">3DGen</span>
        </div>
        
        <nav className="flex items-center gap-8">
          <a href="#" className="text-yellow-500 font-semibold border-b-2 border-yellow-500 pb-2 transition-colors">
            Home
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Gallery
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Explore
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Docs
          </a>
        </nav>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <HelpCircle className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <Settings className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 relative">
          <Bell className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
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