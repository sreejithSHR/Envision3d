import { useState, useEffect, useCallback } from 'react';
import { Job } from '../types';
import apiService from '../services/api';
import { useToast } from './use-toast';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const { toast } = useToast();

  const addJob = useCallback((job: Job) => {
    setJobs(prev => [job, ...prev]);
  }, []);

  const updateJob = useCallback((jobId: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    ));
  }, []);

  const pollJob = useCallback(async (jobId: string) => {
    const response = await apiService.getJobStatus(jobId);
    
    if (response.success && response.data) {
      const job = response.data;
      updateJob(jobId, job);

      if (job.status === 'completed') {
        toast({
          title: "Model Generated!",
          description: `${job.name} has been completed successfully.`,
        });
        return false; // Stop polling
      } else if (job.status === 'failed') {
        toast({
          title: "Generation Failed",
          description: `${job.name} failed to generate.`,
          variant: "destructive"
        });
        return false; // Stop polling
      }
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to get job status",
        variant: "destructive"
      });
      return false; // Stop polling
    }

    return true; // Continue polling
  }, [updateJob, toast]);

  const startPolling = useCallback(() => {
    if (isPolling) return;
    
    setIsPolling(true);
    
    const interval = setInterval(async () => {
      const activeJobs = jobs.filter(job => 
        job.status === 'pending' || job.status === 'processing'
      );

      if (activeJobs.length === 0) {
        setIsPolling(false);
        clearInterval(interval);
        return;
      }

      const promises = activeJobs.map(job => pollJob(job.id));
      const results = await Promise.all(promises);
      
      // If all jobs are done, stop polling
      if (results.every(result => !result)) {
        setIsPolling(false);
        clearInterval(interval);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      setIsPolling(false);
      clearInterval(interval);
    };
  }, [jobs, isPolling, pollJob]);

  useEffect(() => {
    const activeJobs = jobs.filter(job => 
      job.status === 'pending' || job.status === 'processing'
    );

    if (activeJobs.length > 0 && !isPolling) {
      startPolling();
    }
  }, [jobs, isPolling, startPolling]);

  return {
    jobs,
    addJob,
    updateJob,
    isPolling
  };
};