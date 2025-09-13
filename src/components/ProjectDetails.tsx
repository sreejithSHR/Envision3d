import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Share, Download, ExternalLink, FileText, Calendar, Clock, Save, FolderOpen, Trash2 } from 'lucide-react';
import { Job } from '../types';
import fileManager from '../services/fileManager';
import { useToast } from '@/hooks/use-toast';

interface ProjectDetailsProps {
  projectName: string;
  projectDescription: string;
  onProjectNameChange: (name: string) => void;
  onProjectDescriptionChange: (description: string) => void;
  selectedJob: Job | null;
  onPublish: () => void;
  onDeleteJob?: (jobId: string) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  projectName,
  projectDescription,
  onProjectNameChange,
  onProjectDescriptionChange,
  selectedJob,
  onPublish,
  onDeleteJob
}) => {
  const { toast } = useToast();

  const handleDownload = (format: 'glb' | 'ply' | 'mp4') => {
    if (!selectedJob?.downloads?.[format]) {
      toast({
        title: "Download Not Available",
        description: `${format.toUpperCase()} file is not ready for download.`,
        variant: "destructive"
      });
      return;
    }

    fileManager.downloadModel(selectedJob, format).then(result => {
      if (result.success) {
        toast({
          title: "Download Started",
          description: `${format.toUpperCase()} file download has started.`,
        });
      } else {
        toast({
          title: "Download Failed",
          description: result.error || "Failed to download file.",
          variant: "destructive"
        });
      }
    });
  };

  const handleSaveProject = async () => {
    if (!selectedJob) return;

    const result = await fileManager.saveJobData(selectedJob);
    if (result.success) {
      toast({
        title: "Project Saved",
        description: "Project data has been saved successfully.",
      });
    } else {
      toast({
        title: "Save Failed",
        description: result.error || "Failed to save project.",
        variant: "destructive"
      });
    }
  };

  const handleExportProject = async () => {
    if (!selectedJob) return;

    const result = await fileManager.exportProject(selectedJob, true);
    if (result.success) {
      toast({
        title: "Project Exported",
        description: "Project has been exported successfully.",
      });
    } else {
      toast({
        title: "Export Failed",
        description: result.error || "Failed to export project.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteJob = () => {
    if (!selectedJob || !onDeleteJob) return;

    if (confirm(`Are you sure you want to delete "${selectedJob.name}"? This action cannot be undone.`)) {
      onDeleteJob(selectedJob.id);
      toast({
        title: "Job Deleted",
        description: "The job has been deleted successfully.",
      });
    }
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
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>
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
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
      </div>

      {selectedJob && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Current Model</h3>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(selectedJob.status)} border font-medium text-xs`}>
                {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
              </Badge>
              {onDeleteJob && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteJob}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {selectedJob.image && (
            <div className="aspect-video bg-white rounded-md overflow-hidden border border-gray-200 shadow-sm">
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
              <h4 className="font-medium text-gray-900">Download Options</h4>
              <div className="grid grid-cols-1 gap-2">
                {selectedJob.downloads.glb && (
                  <Button
                    variant="outline"
                    onClick={() => handleDownload('glb')}
                    className="justify-start h-auto p-2.5 text-sm"
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
                    className="justify-start h-auto p-2.5 text-sm"
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
                    className="justify-start h-auto p-2.5 text-sm"
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

          {/* Project Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveProject}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportProject}
              className="flex-1"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <Button
          onClick={onPublish}
          disabled={!selectedJob || selectedJob.status !== 'completed' || !selectedJob.downloads?.glb}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          <Share className="w-5 h-5 mr-3" />
          Publish & Share Model
        </Button>
        
        {selectedJob && selectedJob.status === 'completed' && (
          <div className="mt-3 p-2.5 bg-blue-50 rounded-md border border-blue-200">
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