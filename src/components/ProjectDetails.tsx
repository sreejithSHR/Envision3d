import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Share, Download, ExternalLink } from 'lucide-react';
import { Job } from '../types';

interface ProjectDetailsProps {
  projectName: string;
  projectDescription: string;
  onProjectNameChange: (name: string) => void;
  onProjectDescriptionChange: (description: string) => void;
  selectedJob: Job | null;
  onPublish: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  projectName,
  projectDescription,
  onProjectNameChange,
  onProjectDescriptionChange,
  selectedJob,
  onPublish
}) => {
  const handleDownload = (format: 'glb' | 'ply' | 'mp4') => {
    if (!selectedJob?.downloads?.[format]) return;
    
    const link = document.createElement('a');
    link.href = selectedJob.downloads[format]!;
    link.download = `${selectedJob.name}.${format}`;
    link.click();
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="project-name" className="text-sm font-medium text-gray-700">
              Name
            </Label>
            <Input
              id="project-name"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="project-description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="project-description"
              placeholder="Write a short description..."
              value={projectDescription}
              onChange={(e) => onProjectDescriptionChange(e.target.value)}
              className="mt-1 min-h-[100px] resize-none"
            />
          </div>
        </div>
      </div>

      {selectedJob && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Current Model</h3>
            <Badge className={getStatusColor(selectedJob.status)}>
              {selectedJob.status}
            </Badge>
          </div>

          {selectedJob.image && (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={selectedJob.image}
                alt={selectedJob.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Created:</span> {new Date(selectedJob.createdAt).toLocaleDateString()}
            </p>
            {selectedJob.completedAt && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Completed:</span> {new Date(selectedJob.completedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {selectedJob.status === 'processing' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{selectedJob.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${selectedJob.progress}%` }}
                />
              </div>
            </div>
          )}

          {selectedJob.status === 'completed' && selectedJob.downloads && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {selectedJob.downloads.glb && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload('glb')}
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    GLB
                  </Button>
                )}
                
                {selectedJob.downloads.ply && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload('ply')}
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    PLY
                  </Button>
                )}
                
                {selectedJob.downloads.mp4 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload('mp4')}
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    MP4
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <Button
          onClick={onPublish}
          disabled={!selectedJob || selectedJob.status !== 'completed' || !selectedJob.downloads?.glb}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
          size="lg"
        >
          <Share className="w-4 h-4 mr-2" />
          Publish
        </Button>
        
        {selectedJob && selectedJob.status === 'completed' && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Generate a shareable link with Google Model Viewer
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;