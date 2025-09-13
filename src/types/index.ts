export interface Job {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  image?: string;
  createdAt: string;
  completedAt?: string;
  settings?: GenerationSettings;
  downloads?: {
    glb?: string;
    ply?: string;
    mp4?: string;
  };
  thumbnail?: string;
}

export interface GenerationSettings {
  seed?: number;
  randomizeSeed?: boolean;
  guidanceStrength1?: number;
  samplingSteps1?: number;
  guidanceStrength2?: number;
  samplingSteps2?: number;
  symmetry?: 'off' | 'auto' | 'on';
}

export interface Settings {
  apiUrl: string;
  outputDirectory: string;
  theme: 'light' | 'dark';
  autoDownload: boolean;
  maxHistory: number;
  defaultSettings: GenerationSettings;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GenerateRequest {
  image: File;
  name?: string;
  settings?: GenerationSettings;
}

export interface ProjectData {
  version: string;
  job: Job;
  includeAssets: boolean;
  metadata: {
    appVersion: string;
    platform: string;
    exportedAt: string;
  };
}