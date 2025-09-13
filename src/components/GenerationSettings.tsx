import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Settings, RotateCcw } from 'lucide-react';

const GenerationSettings: React.FC = () => {
  const [seed, setSeed] = useState([42]);
  const [randomizeSeed, setRandomizeSeed] = useState(false);
  const [guidanceStrength1, setGuidanceStrength1] = useState([7.5]);
  const [samplingSteps1, setSamplingSteps1] = useState([12]);
  const [guidanceStrength2, setGuidanceStrength2] = useState([3]);
  const [samplingSteps2, setSamplingSteps2] = useState([12]);
  const [symmetry, setSymmetry] = useState('off');

  const resetToDefaults = () => {
    setSeed([42]);
    setRandomizeSeed(false);
    setGuidanceStrength1([7.5]);
    setSamplingSteps1([12]);
    setGuidanceStrength2([3]);
    setSamplingSteps2([12]);
    setSymmetry('off');
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Generation Settings</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefaults}
          className="text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Seed Section */}
      <div className="space-y-4 p-6 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-gray-700">Seed</Label>
          <div className="flex items-center space-x-3">
            <Switch
              id="randomize-seed"
              checked={randomizeSeed}
              onCheckedChange={setRandomizeSeed}
            />
            <Label htmlFor="randomize-seed" className="text-sm text-gray-600">
              Randomize
            </Label>
          </div>
        </div>
        <Input
          type="number"
          value={seed[0]}
          onChange={(e) => setSeed([parseInt(e.target.value) || 0])}
          disabled={randomizeSeed}
          className="w-full bg-white"
        />
      </div>

      {/* Stage 1 Settings */}
      <div className="space-y-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900">Stage 1: Sparse Structure Generation</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-sm font-medium text-blue-800">Guidance Strength</Label>
              <span className="text-sm font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {guidanceStrength1[0]}
              </span>
            </div>
            <Slider
              value={guidanceStrength1}
              onValueChange={setGuidanceStrength1}
              max={20}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-sm font-medium text-blue-800">Sampling Steps</Label>
              <span className="text-sm font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {samplingSteps1[0]}
              </span>
            </div>
            <Slider
              value={samplingSteps1}
              onValueChange={setSamplingSteps1}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Stage 2 Settings */}
      <div className="space-y-6 p-6 bg-purple-50 rounded-xl border border-purple-100">
        <h3 className="text-lg font-semibold text-purple-900">Stage 2: Structure Latent Generation</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-sm font-medium text-purple-800">Guidance Strength</Label>
              <span className="text-sm font-mono text-purple-600 bg-purple-100 px-2 py-1 rounded">
                {guidanceStrength2[0]}
              </span>
            </div>
            <Slider
              value={guidanceStrength2}
              onValueChange={setGuidanceStrength2}
              max={20}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-sm font-medium text-purple-800">Sampling Steps</Label>
              <span className="text-sm font-mono text-purple-600 bg-purple-100 px-2 py-1 rounded">
                {samplingSteps2[0]}
              </span>
            </div>
            <Slider
              value={samplingSteps2}
              onValueChange={setSamplingSteps2}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Symmetry Settings */}
      <div className="space-y-4 p-6 bg-green-50 rounded-xl border border-green-100">
        <Label className="text-lg font-semibold text-green-900">Symmetry</Label>
        <div className="grid grid-cols-3 gap-2">
          {['off', 'auto', 'on'].map((option) => (
            <Button
              key={option}
              variant={symmetry === option ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSymmetry(option)}
              className={
                symmetry === option 
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                  : 'border-green-200 text-green-700 hover:bg-green-100'
              }
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenerationSettings;