export interface ElectronAPI {
  selectFile: () => Promise<{ canceled: boolean; filePaths: string[] }>;
  selectDirectory: () => Promise<{ canceled: boolean; filePaths: string[] }>;
  openExternal: (url: string) => Promise<void>;
  saveHistory: (history: any[]) => Promise<{ success: boolean; error?: string }>;
  loadHistory: () => Promise<{ success: boolean; data: any[] }>;
  downloadFile: (url: string, filename: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  platform: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}