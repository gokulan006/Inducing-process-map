const API_BASE_URL = 'http://localhost:8000';

export interface ProcessMapResult {
  found_processes: boolean;
  process_count: number;
  processes: Array<{
    process_name: string;
    process_description: string;
    process_map_bpmn_xml: string;
    risk_taxonomy: Array<{
      category: string;
      risk_name: string;
      description: string;
    }>;
    controls: Array<{
      control_name: string;
      control_type: string;
      description: string;
      addresses_risk?: string;
      source?: string;
    }>;
    subprocesses?: Array<{
      subprocess_name: string;
      subprocess_bpmn_xml: string;
    }>;
  }>;
  metadata?: {
    strategy: string;
    detected_processes: number;
    chunks_processed: number;
    processing_time: string;
  };
}

export interface UploadResponse {
  task_id: string;
  filename: string;
  file_size: number;
  message: string;
  status: string;
}

export interface TaskStatus {
  task_id: string;
  status: string;
  progress: number;
  detail: string;
  error_message?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async startProcessing(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/process/${taskId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Processing start failed: ${response.statusText}`);
    }
  }

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    const response = await fetch(`${this.baseUrl}/api/status/${taskId}`);

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getResultData(taskId: string): Promise<ProcessMapResult> {
    const response = await fetch(`${this.baseUrl}/api/result-data/${taskId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch results: ${response.statusText}`);
    }

    return response.json();
  }

  getVisualizationUrl(taskId: string): string {
    return `${this.baseUrl}/api/visualize/${taskId}`;
  }

  // Health check to verify backend connection
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const apiService = new ApiService();