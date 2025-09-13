import { Job } from '../types';

export interface SaveOptions {
  directory?: string;
  filename?: string;
  format?: 'glb' | 'ply' | 'mp4';
}

export interface UploadResult {
  success: boolean;
  file?: File;
  error?: string;
}

class FileManager {
  private readonly SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  async selectImageFile(): Promise<UploadResult> {
    try {
      if (!window.electronAPI) {
        // Fallback for web environment
        return this.selectFileWeb();
      }

      const result = await window.electronAPI.selectFile();
      
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'No file selected' };
      }

      const filePath = result.filePaths[0];
      const file = await this.createFileFromPath(filePath);
      
      return this.validateImageFile(file);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to select file'
      };
    }
  }

  async selectSaveDirectory(): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: 'Directory selection not available in web mode' };
      }

      const result = await window.electronAPI.selectDirectory();
      
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'No directory selected' };
      }

      return {
        success: true,
        path: result.filePaths[0]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to select directory'
      };
    }
  }

  async saveJobData(job: Job, options: SaveOptions = {}): Promise<{ success: boolean; error?: string }> {
    try {
      if (!window.electronAPI) {
        return { success: false, error: 'Save functionality not available in web mode' };
      }

      const jobData = {
        ...job,
        savedAt: new Date().toISOString(),
        settings: job.settings || {}
      };

      const filename = options.filename || `${job.name}_${job.id}.json`;
      const result = await window.electronAPI.saveHistory([jobData]);

      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to save job data' };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to save job data'
      };
    }
  }

  async downloadModel(job: Job, format: 'glb' | 'ply' | 'mp4'): Promise<{ success: boolean; error?: string }> {
    try {
      if (!job.downloads?.[format]) {
        return { success: false, error: `${format.toUpperCase()} download not available` };
      }

      const url = job.downloads[format];
      const filename = `${job.name}.${format}`;

      if (window.electronAPI) {
        // Desktop app - use native file dialog
        const result = await window.electronAPI.downloadFile(url, filename);
        
        if (result.success) {
          return { success: true };
        } else {
          return { success: false, error: result.error || 'Download failed' };
        }
      } else {
        // Web fallback - trigger browser download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        return { success: true };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to download model'
      };
    }
  }

  async exportProject(job: Job, includeAssets: boolean = true): Promise<{ success: boolean; error?: string }> {
    try {
      const projectData = {
        version: '1.0.0',
        job: {
          ...job,
          exportedAt: new Date().toISOString()
        },
        includeAssets,
        metadata: {
          appVersion: '1.0.0',
          platform: window.electronAPI?.platform || 'web'
        }
      };

      const filename = `${job.name}_project.json`;
      
      if (window.electronAPI) {
        const result = await window.electronAPI.downloadFile(
          `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(projectData, null, 2))}`,
          filename
        );
        
        return result.success 
          ? { success: true }
          : { success: false, error: result.error || 'Export failed' };
      } else {
        // Web fallback
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        return { success: true };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to export project'
      };
    }
  }

  private async selectFileWeb(): Promise<UploadResult> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = this.SUPPORTED_FORMATS.join(',');
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          resolve(this.validateImageFile(file));
        } else {
          resolve({ success: false, error: 'No file selected' });
        }
      };
      
      input.click();
    });
  }

  private async createFileFromPath(filePath: string): Promise<File> {
    // In a real Electron app, you would read the file from the filesystem
    // For now, we'll simulate this
    const filename = filePath.split('/').pop() || 'image.jpg';
    const blob = new Blob(['mock file content'], { type: 'image/jpeg' });
    return new File([blob], filename, { type: 'image/jpeg' });
  }

  private validateImageFile(file: File): UploadResult {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.SUPPORTED_FORMATS.includes(extension)) {
      return {
        success: false,
        error: `Unsupported file format. Supported formats: ${this.SUPPORTED_FORMATS.join(', ')}`
      };
    }

    return {
      success: true,
      file
    };
  }

  getFileInfo(file: File) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      sizeFormatted: this.formatFileSize(file.size)
    };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new FileManager();