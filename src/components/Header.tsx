import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, User } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <div className="text-2xl font-bold text-yellow-500">Logo</div>
        <nav className="flex items-center gap-6">
          <a href="#" className="text-yellow-500 font-medium border-b-2 border-yellow-500 pb-1">
            Home
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900">
            Gallery
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900">
            Explore
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900">
            Docs/Help
          </a>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm">
          <Bell className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <User className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;