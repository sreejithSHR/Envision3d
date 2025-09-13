import axios, { AxiosResponse } from 'axios';
import { Job, GenerateRequest, ApiResponse } from '../types';

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  setBaseURL(url: string) {
    this.baseURL = url;
  }

  async generateModel(request: GenerateRequest): Promise<ApiResponse<{ jobId: string }>> {
    try {
      const formData = new FormData();
      formData.append('image', request.image);
      if (request.name) formData.append('name', request.name);
      if (request.settings) {
        formData.append('settings', JSON.stringify(request.settings));
      }

      const response: AxiosResponse = await axios.post(
        `${this.baseURL}/generate`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      return {
        success: true,
        data: { jobId: response.data.job_id || response.data.jobId }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to start generation'
      };
    }
  }

  async getJobStatus(jobId: string): Promise<ApiResponse<Job>> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseURL}/jobs/${jobId}`,
        { timeout: 10000 }
      );

      const jobData = response.data;
      const job: Job = {
        id: jobId,
        name: jobData.name || `Job ${jobId}`,
        status: jobData.status || 'pending',
        progress: jobData.progress || 0,
        createdAt: jobData.created_at || new Date().toISOString(),
        completedAt: jobData.completed_at,
        downloads: jobData.downloads ? {
          glb: jobData.downloads.glb,
          ply: jobData.downloads.ply,
          mp4: jobData.downloads.mp4
        } : undefined,
        thumbnail: jobData.thumbnail
      };

      return {
        success: true,
        data: job
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get job status'
      };
    }
  }

  async downloadFile(url: string): Promise<Blob> {
    const response = await axios.get(url, {
      responseType: 'blob',
      timeout: 60000
    });
    return response.data;
  }
}

export default new ApiService();