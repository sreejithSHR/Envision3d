import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Download, 
  ExternalLink, 
  Trash2, 
  Calendar,
  Filter
} from 'lucide-react';
import { Job } from '../types';
import { cn } from '@/lib/utils';

interface HistoryPanelProps {
  jobs: Job[];
  onViewModel: (job: Job) => void;
  onDownload: (job: Job, format: 'glb' | 'ply' | 'mp4') => void;
  onDeleteJob: (jobId: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  jobs, 
  onViewModel, 
  onDownload,
  onDeleteJob 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Job['status']>('all');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const totalJobs = jobs.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Generation History</h2>
          <p className="text-sm text-gray-400">
            {completedJobs} of {totalJobs} models completed
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-sm"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No models found</h3>
                <p className="text-gray-400">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Your generation history will appear here.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="overflow-hidden group">
              <div className="relative">
                {job.image && (
                  <div className="aspect-video bg-gray-800 overflow-hidden">
                    <img
                      src={job.image}
                      alt={job.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="absolute top-2 right-2">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getStatusColor(job.status))}
                  >
                    {job.status}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium truncate">{job.name}</h3>
                    <p className="text-xs text-gray-400">
                      {formatDate(job.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewModel(job)}
                        className="flex-1 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteJob(job.id)}
                      className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {job.status === 'completed' && job.downloads && (
                    <div className="flex items-center gap-1">
                      {job.downloads.glb && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(job, 'glb')}
                          className="flex-1 text-xs"
                        >
                          GLB
                        </Button>
                      )}
                      
                      {job.downloads.ply && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(job, 'ply')}
                          className="flex-1 text-xs"
                        >
                          PLY
                        </Button>
                      )}
                      
                      {job.downloads.mp4 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(job, 'mp4')}
                          className="flex-1 text-xs"
                        >
                          MP4
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;