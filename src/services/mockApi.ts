import { Job, GenerateRequest, ApiResponse } from '../types';

// Mock API service that simulates a real backend
class MockApiService {
  private jobs: Map<string, Job> = new Map();
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  setBaseURL(url: string) {
    this.baseURL = url;
  }

  // Simulate file upload and job creation
  async generateModel(request: GenerateRequest): Promise<ApiResponse<{ jobId: string }>> {
    try {
      // Simulate network delay
      await this.delay(500);

      const jobId = this.generateJobId();
      const imageUrl = URL.createObjectURL(request.image);

      const job: Job = {
        id: jobId,
        name: request.name || request.image.name.replace(/\.[^/.]+$/, ''),
        status: 'pending',
        progress: 0,
        image: imageUrl,
        createdAt: new Date().toISOString(),
        settings: request.settings
      };

      this.jobs.set(jobId, job);

      // Start simulated processing
      this.simulateProcessing(jobId);

      return {
        success: true,
        data: { jobId }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to start generation'
      };
    }
  }

  async getJobStatus(jobId: string): Promise<ApiResponse<Job>> {
    try {
      await this.delay(100);

      const job = this.jobs.get(jobId);
      if (!job) {
        return {
          success: false,
          error: 'Job not found'
        };
      }

      return {
        success: true,
        data: job
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get job status'
      };
    }
  }

  async getAllJobs(): Promise<ApiResponse<Job[]>> {
    try {
      await this.delay(200);
      const jobs = Array.from(this.jobs.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        success: true,
        data: jobs
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get jobs'
      };
    }
  }

  async deleteJob(jobId: string): Promise<ApiResponse<void>> {
    try {
      await this.delay(100);
      
      const job = this.jobs.get(jobId);
      if (job?.image) {
        URL.revokeObjectURL(job.image);
      }
      
      this.jobs.delete(jobId);

      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete job'
      };
    }
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async simulateProcessing(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Update to processing
    job.status = 'processing';
    job.progress = 0;

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      const currentJob = this.jobs.get(jobId);
      if (!currentJob || currentJob.status !== 'processing') {
        clearInterval(progressInterval);
        return;
      }

      currentJob.progress = Math.min(currentJob.progress + Math.random() * 15, 95);
      
      // Complete after reaching high progress
      if (currentJob.progress >= 90) {
        clearInterval(progressInterval);
        this.completeJob(jobId);
      }
    }, 1000);
  }

  private completeJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Simulate successful completion with download URLs
    job.status = 'completed';
    job.progress = 100;
    job.completedAt = new Date().toISOString();
    job.downloads = {
      glb: this.generateMockDownloadUrl('glb'),
      ply: this.generateMockDownloadUrl('ply'),
      mp4: this.generateMockDownloadUrl('mp4')
    };
    job.thumbnail = job.image; // Use original image as thumbnail for demo
  }

  private generateMockDownloadUrl(format: string): string {
    // In a real app, these would be actual file URLs
    return `https://example.com/downloads/${Date.now()}.${format}`;
  }
}

export default new MockApiService();