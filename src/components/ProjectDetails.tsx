import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Share, Download, ExternalLink, FileText, Calendar, Clock } from 'lucide-react';
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="project-name" className="text-sm font-semibold text-gray-700 mb-2 block">
              Project Name
            </Label>
            <Input
              id="project-name"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="project-description" className="text-sm font-semibold text-gray-700 mb-2 block">
              Description
            </Label>
            <Textarea
              id="project-description"
              placeholder="Describe your 3D model project..."
              value={projectDescription}
              onChange={(e) => onProjectDescriptionChange(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
        </div>
      </div>

      {selectedJob && (
        <div className="space-y-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Current Model</h3>
            <Badge className={`${getStatusColor(selectedJob.status)} border font-medium`}>
              {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
            </Badge>
          </div>

          {selectedJob.image && (
            <div className="aspect-video bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={selectedJob.image}
                alt={selectedJob.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Created: {new Date(selectedJob.createdAt).toLocaleDateString()}</span>
            </div>
            {selectedJob.completedAt && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Completed: {new Date(selectedJob.completedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {selectedJob.status === 'processing' && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Generation Progress</span>
                <span className="font-semibold text-blue-600">{selectedJob.progress}%</span>
              </div>
              <Progress value={selectedJob.progress} className="h-2" />
              <p className="text-xs text-gray-500">
                This may take a few minutes depending on image complexity
              </p>
            </div>
          )}

          {selectedJob.status === 'completed' && selectedJob.downloads && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Download Options</h4>
              <div className="grid grid-cols-1 gap-2">
                {selectedJob.downloads.glb && (
                  <Button
                    variant="outline"
                    onClick={() => handleDownload('glb')}
                    className="justify-start h-auto p-3"
                  >
                    <Download className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">GLB Format</div>
                      <div className="text-xs text-gray-500">3D model for web and AR</div>
                    </div>
                  </Button>
                )}
                
                {selectedJob.downloads.ply && (
                  <Button
                    variant="outline"
                    onClick={() => handleDownload('ply')}
                    className="justify-start h-auto p-3"
                  >
                    <Download className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">PLY Format</div>
                      <div className="text-xs text-gray-500">Point cloud data</div>
                    </div>
                  </Button>
                )}
                
                {selectedJob.downloads.mp4 && (
                  <Button
                    variant="outline"
                    onClick={() => handleDownload('mp4')}
                    className="justify-start h-auto p-3"
                  >
                    <Download className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">MP4 Video</div>
                      <div className="text-xs text-gray-500">360° rotation preview</div>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pt-6 border-t border-gray-200">
        <Button
          onClick={onPublish}
          disabled={!selectedJob || selectedJob.status !== 'completed' || !selectedJob.downloads?.glb}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          <Share className="w-5 h-5 mr-3" />
          Publish & Share Model
        </Button>
        
        {selectedJob && selectedJob.status === 'completed' && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium">Share your 3D model</p>
                <p>Creates a shareable link with Google Model Viewer for interactive viewing</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;