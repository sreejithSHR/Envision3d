import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, Sparkles, X, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import apiService from '../services/api';
import { Job } from '../types';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  uploadedImage: File | null;
  onImageUpload: (file: File) => void;
  onJobCreated: (job: Job) => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  uploadedImage,
  onImageUpload,
  onJobCreated,
  projectName,
  onProjectNameChange
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast({
        title: "No image selected",
        description: "Please upload an image to generate a 3D model.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await apiService.generateModel({
        image: uploadedImage,
        name: projectName || uploadedImage.name.replace(/\.[^/.]+$/, ''),
        settings: {
          seed: Math.floor(Math.random() * 1000000),
          guidanceStrength1: 7.5,
          samplingSteps1: 12,
          guidanceStrength2: 3,
          samplingSteps2: 12,
          symmetry: 'off'
        }
      });

      if (response.success && response.data) {
        const newJob: Job = {
          id: response.data.jobId,
          name: projectName || uploadedImage.name.replace(/\.[^/.]+$/, ''),
          status: 'pending',
          progress: 0,
          image: URL.createObjectURL(uploadedImage),
          createdAt: new Date().toISOString()
        };

        onJobCreated(newJob);

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

  const removeImage = () => {
    onImageUpload(null as any);
    onProjectNameChange('');
  };

  return (
    <div className="p-8 border-b border-gray-100">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Image</h2>
          <p className="text-sm text-gray-600">Upload an image to generate a 3D model</p>
        </div>

        {/* Project Name Input */}
        <div className="space-y-2">
          <Label htmlFor="project-name" className="text-sm font-medium text-gray-700">
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

        {/* Image Upload Area */}
        <div className="space-y-4">
          {!uploadedImage ? (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                isDragActive 
                  ? "border-yellow-400 bg-yellow-50 scale-[1.02]" 
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              )}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    {isDragActive ? "Drop your image here" : "Drag & drop your image"}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    or click to browse files
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <FileImage className="w-4 h-4" />
                    <span>PNG, JPG, JPEG, GIF, BMP, WEBP</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={URL.createObjectURL(uploadedImage)}
                    alt="Uploaded"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{uploadedImage.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Ready to generate</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeImage}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!uploadedImage || isGenerating}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-3" />
              Generating 3D Model...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-3" />
              Generate 3D Model
            </>
          )}
        </Button>

        {!uploadedImage && (
          <p className="text-xs text-gray-400 text-center">
            Upload an image to start generating your 3D model
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;