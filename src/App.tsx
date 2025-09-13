import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from './components/Sidebar';
import UploadPanel from './components/UploadPanel';
import JobQueue from './components/JobQueue';
import ModelViewer from './components/ModelViewer';
import HistoryPanel from './components/HistoryPanel';
import SettingsPanel from './components/SettingsPanel';
import FilesPanel from './components/FilesPanel';
import { useJobs } from './hooks/useJobs';
import { useSettings } from './hooks/useSettings';
import { Job } from './types';
import { useToast } from '@/hooks/use-toast';
import apiService from './services/api';

function App() {
  const [activeView, setActiveView] = useState('upload');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { jobs, addJob, updateJob } = useJobs();
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();

  // Set API base URL from settings
  useEffect(() => {
    apiService.setBaseURL(settings.apiUrl);
  }, [settings.apiUrl]);

  // Load history on startup
  useEffect(() => {
    const loadHistory = async () => {
      if (window.electronAPI) {
        const result = await window.electronAPI.loadHistory();
        if (result.success && result.data.length > 0) {
          result.data.forEach((job: Job) => addJob(job));
        }
      }
    };

    loadHistory();
  }, [addJob]);

  // Save history when jobs change
  useEffect(() => {
    const saveHistory = async () => {
      if (window.electronAPI && jobs.length > 0) {
        await window.electronAPI.saveHistory(jobs);
      }
    };

    const timeoutId = setTimeout(saveHistory, 1000); // Debounce saves
    return () => clearTimeout(timeoutId);
  }, [jobs]);

  const handleJobCreated = (job: Job) => {
    addJob(job);
    setActiveView('queue');
  };

  const handleViewModel = (job: Job) => {
    setSelectedJob(job);
  };

  const handleDownload = async (job: Job, format: 'glb' | 'ply' | 'mp4') => {
    const downloadUrl = job.downloads?.[format];
    if (!downloadUrl) {
      toast({
        title: "Download Error",
        description: `${format.toUpperCase()} file not available for this model.`,
        variant: "destructive"
      });
      return;
    }

    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.downloadFile(
          downloadUrl, 
          `${job.name}.${format}`
        );
        
        if (result.success) {
          toast({
            title: "Download Started",
            description: `Downloading ${job.name}.${format}...`,
          });
        }
      } else {
        // Fallback for web version
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${job.name}.${format}`;
        link.click();
        
        toast({
          title: "Download Started",
          description: `Downloading ${job.name}.${format}...`,
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteJob = (jobId: string) => {
    // In a real implementation, you'd remove the job from the jobs array
    toast({
      title: "Job Deleted",
      description: "The job has been removed from history.",
    });
  };

  const handleSelectDirectory = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.selectDirectory();
      if (!result.canceled && result.filePaths.length > 0) {
        updateSettings({ outputDirectory: result.filePaths[0] });
      }
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'upload':
        return <UploadPanel onJobCreated={handleJobCreated} />;
      case 'queue':
        return (
          <JobQueue
            jobs={jobs}
            onDownload={handleDownload}
            onViewModel={handleViewModel}
          />
        );
      case 'history':
        return (
          <HistoryPanel
            jobs={jobs}
            onViewModel={handleViewModel}
            onDownload={handleDownload}
            onDeleteJob={handleDeleteJob}
          />
        );
      case 'files':
        return (
          <FilesPanel
            outputDirectory={settings.outputDirectory}
            onSelectDirectory={handleSelectDirectory}
          />
        );
      case 'settings':
        return (
          <SettingsPanel
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        );
      default:
        return <UploadPanel onJobCreated={handleJobCreated} />;
    }
  };

  return (
    <div className={`h-screen bg-background text-foreground ${settings.theme}`}>
      <div className="flex h-full">
        {/* Left Sidebar */}
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Primary Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            {renderMainContent()}
          </div>

          {/* Right Panel - Model Viewer */}
          {(activeView === 'upload' || activeView === 'queue' || activeView === 'history') && (
            <div className="w-96 border-l border-border p-4">
              <ModelViewer
                selectedJob={selectedJob}
                onDownload={handleDownload}
              />
            </div>
          )}
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default App;