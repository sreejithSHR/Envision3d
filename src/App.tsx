import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import Header from './components/Header';
import GenerationSettings from './components/GenerationSettings';
import ThreeDSpace from './components/ThreeDSpace';
import ProjectDetails from './components/ProjectDetails';
import ImageUploader from './components/ImageUploader';
import { useJobs } from './hooks/useJobs';
import { useSettings } from './hooks/useSettings';
import { Job } from './types';
import { useToast } from '@/hooks/use-toast';
import mockApiService from './services/mockApi';
import fileManager from './services/fileManager';

function App() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const { jobs, addJob, updateJob, deleteJob } = useJobs();
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();

  // Set API base URL from settings
  useEffect(() => {
    mockApiService.setBaseURL(settings.apiUrl);
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
  };

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    if (!projectName) {
      setProjectName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handlePublish = async () => {
    if (!selectedJob || !selectedJob.downloads?.glb) {
      toast({
        title: "No Model to Publish",
        description: "Please generate a 3D model first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate a unique ID for the published model
      const publishId = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create shareable URL with Google Model Viewer
      const shareableUrl = `https://modelviewer.dev/editor/?src=${encodeURIComponent(selectedJob.downloads.glb)}&title=${encodeURIComponent(selectedJob.name)}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareableUrl);
      
      toast({
        title: "Model Published!",
        description: "Shareable link copied to clipboard. Anyone can view your 3D model now.",
      });
    } catch (error) {
      toast({
        title: "Publish Failed",
        description: "Failed to publish the model. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOpenProject = async () => {
    const result = await fileManager.selectImageFile();
    if (result.success && result.file) {
      handleImageUpload(result.file);
      toast({
        title: "Project Opened",
        description: "Image loaded successfully.",
      });
    }
  };

  const handleSaveProject = async () => {
    if (!selectedJob) {
      toast({
        title: "No Project to Save",
        description: "Please select a project first.",
        variant: "destructive"
      });
      return;
    }

    const result = await fileManager.saveJobData(selectedJob);
    if (result.success) {
      toast({
        title: "Project Saved",
        description: "Project has been saved successfully.",
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
    if (!selectedJob) {
      toast({
        title: "No Project to Export",
        description: "Please select a project first.",
        variant: "destructive"
      });
      return;
    }

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

  const handleDeleteJob = (jobId: string) => {
    if (selectedJob?.id === jobId) {
      setSelectedJob(null);
    }
    deleteJob(jobId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        onOpenProject={handleOpenProject}
        onSaveProject={handleSaveProject}
        onExportProject={handleExportProject}
      />
      
      <div className="flex flex-1 h-[calc(100vh-80px)]">
        {/* Left Panel - Generation Settings */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="flex-1 overflow-auto">
            <ImageUploader
              uploadedImage={uploadedImage}
              onImageUpload={handleImageUpload}
              onJobCreated={handleJobCreated}
              projectName={projectName}
              onProjectNameChange={setProjectName}
            />
            <GenerationSettings />
          </div>
        </div>

        {/* Center - 3D Space */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100">
          <ThreeDSpace
            selectedJob={selectedJob}
            uploadedImage={uploadedImage}
            onJobSelect={setSelectedJob}
            jobs={jobs}
          />
        </div>

        {/* Right Panel - Project Details */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-auto">
          <ProjectDetails
            projectName={projectName}
            projectDescription={projectDescription}
            onProjectNameChange={setProjectName}
            onProjectDescriptionChange={setProjectDescription}
            selectedJob={selectedJob}
            onPublish={handlePublish}
            onDeleteJob={handleDeleteJob}
          />
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default App;