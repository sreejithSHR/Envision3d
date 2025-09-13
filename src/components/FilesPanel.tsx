import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, 
  File, 
  Search,
  ExternalLink,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'glb' | 'ply' | 'mp4';
  size: number;
  path: string;
  createdAt: string;
  associatedJob?: string;
}

interface FilesPanelProps {
  outputDirectory: string;
  onSelectDirectory: () => void;
}

const FilesPanel: React.FC<FilesPanelProps> = ({ 
  outputDirectory,
  onSelectDirectory
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockFiles: FileItem[] = [
      {
        id: '1',
        name: 'fantasy_character.glb',
        type: 'glb',
        size: 2048576,
        path: '/downloads/fantasy_character.glb',
        createdAt: new Date().toISOString(),
        associatedJob: 'job_123'
      },
      {
        id: '2',
        name: 'dragon_sculpture.ply',
        type: 'ply',
        size: 5242880,
        path: '/downloads/dragon_sculpture.ply',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        associatedJob: 'job_124'
      },
      {
        id: '3',
        name: 'animation_preview.mp4',
        type: 'mp4',
        size: 15728640,
        path: '/downloads/animation_preview.mp4',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        associatedJob: 'job_125'
      }
    ];
    setFiles(mockFiles);
  }, []);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileTypeColor = (type: FileItem['type']) => {
    switch (type) {
      case 'glb':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'ply':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'mp4':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const refreshFiles = () => {
    setIsLoading(true);
    // In a real implementation, this would scan the output directory
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const openFile = async (file: FileItem) => {
    if (window.electronAPI) {
      await window.electronAPI.openExternal(file.path);
    }
  };

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const openInExplorer = async (path: string) => {
    if (window.electronAPI) {
      // In a real implementation, this would open the file location in the system file manager
      await window.electronAPI.openExternal(path);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Files
          </h2>
          <p className="text-sm text-gray-400">
            Manage your downloaded 3D models and exports
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshFiles}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Output Directory Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Output Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="No directory selected..."
              value={outputDirectory || ''}
              readOnly
              className="flex-1"
            />
            <Button variant="outline" onClick={onSelectDirectory}>
              <FolderOpen className="w-4 h-4 mr-2" />
              Browse
            </Button>
          </div>
          {outputDirectory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openInExplorer(outputDirectory)}
              className="mt-2"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Open in Explorer
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* File Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {files.filter(f => f.type === 'glb').length}
            </div>
            <div className="text-sm text-gray-400">GLB Models</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {files.filter(f => f.type === 'ply').length}
            </div>
            <div className="text-sm text-gray-400">PLY Files</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {files.filter(f => f.type === 'mp4').length}
            </div>
            <div className="text-sm text-gray-400">MP4 Videos</div>
          </CardContent>
        </Card>
      </div>

      {/* Files List */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <File className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No files found</h3>
                <p className="text-gray-400">
                  {searchTerm 
                    ? 'No files match your search criteria.' 
                    : 'Your downloaded files will appear here.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                    <File className="w-6 h-6 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{file.name}</h3>
                      <Badge 
                        variant="outline" 
                        className={getFileTypeColor(file.type)}
                      >
                        {file.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openFile(file)}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInExplorer(file.path)}
                    >
                      <FolderOpen className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteFile(file.id)}
                      className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilesPanel;