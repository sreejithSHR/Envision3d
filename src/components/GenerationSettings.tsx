import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import apiService from '../services/api';
import { Job } from '../types';
import { useToast } from '@/hooks/use-toast';

interface GenerationSettingsProps {
  uploadedImage: File | null;
  onImageUpload: (file: File) => void;
  onJobCreated: (job: Job) => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

const GenerationSettings: React.FC<GenerationSettingsProps> = ({
  uploadedImage,
  onImageUpload,
  onJobCreated,
  projectName,
  onProjectNameChange
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [seed, setSeed] = useState([0]);
  const [randomizeSeed, setRandomizeSeed] = useState(false);
  const [guidanceStrength1, setGuidanceStrength1] = useState([7.5]);
  const [samplingSteps1, setSamplingSteps1] = useState([12]);
  const [guidanceStrength2, setGuidanceStrength2] = useState([3]);
  const [samplingSteps2, setSamplingSteps2] = useState([12]);
  const [symmetry, setSymmetry] = useState('off');
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
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
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
          seed: randomizeSeed ? Math.floor(Math.random() * 1000000) : seed[0],
          guidanceStrength1: guidanceStrength1[0],
          samplingSteps1: samplingSteps1[0],
          guidanceStrength2: guidanceStrength2[0],
          samplingSteps2: samplingSteps2[0],
          symmetry
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generation Settings</h2>
        
        {/* Seed */}
        <div className="space-y-3 mb-6">
          <Label className="text-sm font-medium text-gray-700">Seed</Label>
          <Input
            type="number"
            value={seed[0]}
            onChange={(e) => setSeed([parseInt(e.target.value) || 0])}
            disabled={randomizeSeed}
            className="w-full"
          />
          <div className="flex items-center space-x-2">
            <Switch
              id="randomize-seed"
              checked={randomizeSeed}
              onCheckedChange={setRandomizeSeed}
            />
            <Label htmlFor="randomize-seed" className="text-sm text-gray-600">
              Randomize Seed
            </Label>
          </div>
        </div>

        {/* Stage 1: Sparse Structure Generation */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700">Stage 1: Sparse Structure Generation</h3>
          
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Guidance Strength</Label>
            <div className="px-2">
              <Slider
                value={guidanceStrength1}
                onValueChange={setGuidanceStrength1}
                max={20}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>
            <div className="text-xs text-gray-500">{guidanceStrength1[0]}</div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Sampling Steps</Label>
            <div className="px-2">
              <Slider
                value={samplingSteps1}
                onValueChange={setSamplingSteps1}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div className="text-xs text-gray-500">{samplingSteps1[0]}</div>
          </div>
        </div>

        {/* Stage 2: Structure Latent Generation */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700">Stage 2: Structure Latent Generation</h3>
          
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Guidance Strength</Label>
            <div className="px-2">
              <Slider
                value={guidanceStrength2}
                onValueChange={setGuidanceStrength2}
                max={20}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>
            <div className="text-xs text-gray-500">{guidanceStrength2[0]}</div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Sampling Steps</Label>
            <div className="px-2">
              <Slider
                value={samplingSteps2}
                onValueChange={setSamplingSteps2}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div className="text-xs text-gray-500">{samplingSteps2[0]}</div>
          </div>
        </div>

        {/* Symmetry */}
        <div className="space-y-3 mb-6">
          <Label className="text-sm font-medium text-gray-700">Symmetry</Label>
          <div className="flex gap-2">
            <Button
              variant={symmetry === 'off' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSymmetry('off')}
              className={symmetry === 'off' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}
            >
              Off
            </Button>
            <Button
              variant={symmetry === 'auto' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSymmetry('auto')}
              className={symmetry === 'auto' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}
            >
              Auto
            </Button>
            <Button
              variant={symmetry === 'on' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSymmetry('on')}
              className={symmetry === 'on' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}
            >
              On
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-3">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isDragActive 
                ? "border-yellow-500 bg-yellow-50" 
                : "border-gray-300 hover:border-gray-400",
              uploadedImage && "border-green-500 bg-green-50"
            )}
          >
            <input {...getInputProps()} />
            {uploadedImage ? (
              <div className="space-y-3">
                <img
                  src={URL.createObjectURL(uploadedImage)}
                  alt="Uploaded"
                  className="max-w-full max-h-32 mx-auto rounded-lg"
                />
                <p className="text-sm font-medium text-gray-900">{uploadedImage.name}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {isDragActive ? "Drop image here" : "Drag & drop your image here"}
                  </p>
                  <p className="text-xs text-gray-500">Upload image</p>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!uploadedImage || isGenerating}
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
        </div>
      </div>
    </div>
  );
};

export default GenerationSettings;