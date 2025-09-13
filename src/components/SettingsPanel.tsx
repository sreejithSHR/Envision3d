import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Server, 
  FolderOpen, 
  Palette,
  Download,
  Database
} from 'lucide-react';
import { Settings } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onUpdateSettings: (updates: Partial<Settings>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  settings, 
  onUpdateSettings 
}) => {
  const handleSelectDirectory = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.selectDirectory();
      if (!result.canceled && result.filePaths.length > 0) {
        onUpdateSettings({ outputDirectory: result.filePaths[0] });
      }
    }
  };

  const testApiConnection = async () => {
    try {
      const response = await fetch(`${settings.apiUrl}/health`);
      if (response.ok) {
        alert('API connection successful!');
      } else {
        alert('API connection failed. Please check your URL.');
      }
    } catch (error) {
      alert('Failed to connect to API. Please check your URL and network connection.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Settings
        </h2>
        <p className="text-sm text-gray-400">Configure your 3DGen application preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Server className="w-4 h-4" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API Base URL</Label>
              <div className="flex gap-2">
                <Input
                  id="apiUrl"
                  placeholder="http://localhost:8000"
                  value={settings.apiUrl}
                  onChange={(e) => onUpdateSettings({ apiUrl: e.target.value })}
                />
                <Button 
                  variant="outline" 
                  onClick={testApiConnection}
                  className="whitespace-nowrap"
                >
                  Test Connection
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                URL of your Trellis backend API server.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Download Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="w-4 h-4" />
              Download Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="outputDirectory">Default Download Directory</Label>
              <div className="flex gap-2">
                <Input
                  id="outputDirectory"
                  placeholder="Select download directory..."
                  value={settings.outputDirectory}
                  onChange={(e) => onUpdateSettings({ outputDirectory: e.target.value })}
                  readOnly
                />
                <Button 
                  variant="outline" 
                  onClick={handleSelectDirectory}
                  className="whitespace-nowrap"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Browse
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Choose where downloaded models will be saved.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="autoDownload">Auto-download completed models</Label>
                <p className="text-xs text-gray-400">
                  Automatically download models when generation completes.
                </p>
              </div>
              <Switch
                id="autoDownload"
                checked={settings.autoDownload}
                onCheckedChange={(checked) => onUpdateSettings({ autoDownload: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="w-4 h-4" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button
                  variant={settings.theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateSettings({ theme: 'dark' })}
                >
                  Dark
                </Button>
                <Button
                  variant={settings.theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateSettings({ theme: 'light' })}
                >
                  Light
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="w-4 h-4" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxHistory">Maximum History Items</Label>
              <Input
                id="maxHistory"
                type="number"
                min="10"
                max="1000"
                value={settings.maxHistory}
                onChange={(e) => onUpdateSettings({ maxHistory: parseInt(e.target.value) || 100 })}
              />
              <p className="text-xs text-gray-400">
                Maximum number of items to keep in history (10-1000).
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full text-red-400 border-red-400/30 hover:bg-red-400/10"
              >
                Clear All History
              </Button>
              <p className="text-xs text-gray-400 text-center">
                This action cannot be undone.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center font-bold text-black mx-auto">
                3D
              </div>
              <div>
                <h3 className="font-semibold">3DGen Desktop</h3>
                <p className="text-sm text-gray-400">Version 1.0.0</p>
                <p className="text-xs text-gray-400 mt-2">
                  Built with Electron, React, and Three.js
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPanel;