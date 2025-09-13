import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Job } from '../types';
import { cn } from '@/lib/utils';

interface JobQueueProps {
  jobs: Job[];
  onDownload: (job: Job, format: 'glb' | 'ply' | 'mp4') => void;
  onViewModel: (job: Job) => void;
}

const JobQueue: React.FC<JobQueueProps> = ({ jobs, onDownload, onViewModel }) => {
  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No jobs in queue</h3>
              <p className="text-gray-400">Start by uploading an image to generate your first 3D model.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Job Queue</h2>
        <Badge variant="secondary">{jobs.length} jobs</Badge>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {job.image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                    <img
                      src={job.image}
                      alt={job.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{job.name}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getStatusColor(job.status))}
                      >
                        {job.status}
                      </Badge>
                    </div>
                  </div>

                  {job.status === 'processing' && (
                    <div className="space-y-1">
                      <Progress value={job.progress} className="h-2" />
                      <p className="text-xs text-gray-400">{job.progress}% complete</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Created: {formatDate(job.createdAt)}</span>
                    {job.completedAt && (
                      <span>Completed: {formatDate(job.completedAt)}</span>
                    )}
                  </div>

                  {job.status === 'completed' && job.downloads && (
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewModel(job)}
                        className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      
                      {job.downloads.glb && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(job, 'glb')}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          GLB
                        </Button>
                      )}
                      
                      {job.downloads.ply && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(job, 'ply')}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          PLY
                        </Button>
                      )}
                      
                      {job.downloads.mp4 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(job, 'mp4')}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          MP4
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JobQueue;