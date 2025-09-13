import { useState, useEffect } from 'react';
import { Settings, GenerationSettings } from '../types';

const DEFAULT_GENERATION_SETTINGS: GenerationSettings = {
  seed: 42,
  randomizeSeed: false,
  guidanceStrength1: 7.5,
  samplingSteps1: 12,
  guidanceStrength2: 3,
  samplingSteps2: 12,
  symmetry: 'off'
};

const DEFAULT_SETTINGS: Settings = {
  apiUrl: 'http://localhost:8000',
  outputDirectory: '',
  theme: 'dark',
  autoDownload: false,
  maxHistory: 100,
  defaultSettings: DEFAULT_GENERATION_SETTINGS
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem('3dgen-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const updateSettings = (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('3dgen-settings', JSON.stringify(newSettings));
  };

  return {
    settings,
    updateSettings,
    defaultGenerationSettings: DEFAULT_GENERATION_SETTINGS
  };
};