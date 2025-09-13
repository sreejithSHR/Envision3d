import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import apiService from '../services/api';
import { Job } from '../types';
import { useToast } from '@/hooks/use-toast';

interface UploadPanelProps {
  onJobCreated: (job: Job) => void;
}

const UploadPanel: React.FC<UploadPanelProps> = ({ onJobCreated }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobName, setJobName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      if (!jobName) {
        setJobName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [jobName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    },
    multiple: false
  });

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast({
        title: "No image selected",
        description: "Please select an image to generate a 3D model.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await apiService.generateModel({
        image: selectedFile,
        name: jobName || selectedFile.name.replace(/\.[^/.]+$/, '')
      });

      if (response.success && response.data) {
        const newJob: Job = {
          id: response.data.jobId,
          name: jobName || selectedFile.name.replace(/\.[^/.]+$/, ''),
          status: 'pending',
          progress: 0,
          image: URL.createObjectURL(selectedFile),
          createdAt: new Date().toISOString()
        };

        onJobCreated(newJob);
        
        // Reset form
        setSelectedFile(null);
        setJobName('');

        toast({
          title: "Generation Started!",
          description: "Your 3D model generation has been queued.",
        });
      } else {
        throw new Error(response.error || 'Failed to start generation');
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to start 3D model generation.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.selectFile();
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        // In Electron, we'd need to handle file reading differently
        // For now, we'll use the web file input as fallback
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            New Model Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobName">Model Name</Label>
            <Input
              id="jobName"
              placeholder="Enter model name..."
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Image</Label>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive 
                  ? "border-yellow-500 bg-yellow-500/10" 
                  : "border-gray-600 hover:border-gray-500",
                selectedFile && "border-green-500 bg-green-500/10"
              )}
            >
              <input {...getInputProps()} />
              {selectedFile ? (
                <div className="space-y-4">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected"
                    className="max-w-full max-h-48 mx-auto rounded-lg"
                  />
                  <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-medium">
                      {isDragActive ? "Drop image here" : "Click or drag image to upload"}
                    </p>
                    <p className="text-sm text-gray-400">
                      Supports: PNG, JPG, JPEG, GIF, BMP
                    </p>
                    <p className="text-sm text-gray-400">Max size: 20MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!selectedFile || isGenerating}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate 3D Model
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPanel;