// Enhanced API Service for History Panel
export interface HistoryItem {
  id: string;
  name: string;
  processCount: number;
  generatedDate: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  type: string;
  size?: number;
  taskId: string;
}

export interface HistoryResponse {
  history: HistoryItem[];
  total: number;
  filtered: number;
}

export interface Statistics {
  totalDocuments: number;
  completedDocuments: number;
  processingDocuments: number;
  errorDocuments: number;
  totalProcessesExtracted: number;
  successRate: number;
}

export class HistoryApiService {
  private static instance: HistoryApiService;
  private baseUrl = 'http://localhost:8000/api';

  public static getInstance(): HistoryApiService {
    if (!HistoryApiService.instance) {
      HistoryApiService.instance = new HistoryApiService();
    }
    return HistoryApiService.instance;
  }

  // Test backend connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  // Get document history with search and filter
  async getHistory(search?: string, filterType?: string): Promise<{ success: boolean; data?: HistoryResponse; error?: string }> {
    try {
      const params = new URLSearchParams();
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      if (filterType && filterType !== 'all') {
        params.append('filter_type', filterType);
      }

      const url = `${this.baseUrl}/history${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.detail || `Failed to fetch history: ${response.status}` 
        };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error('History fetch error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch history' 
      };
    }
  }

  // Get platform statistics
  async getStatistics(): Promise<{ success: boolean; data?: Statistics; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.detail || `Failed to fetch statistics: ${response.status}` 
        };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error('Statistics fetch error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch statistics' 
      };
    }
  }

  // Delete history item
  async deleteHistoryItem(taskId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.detail || `Failed to delete item: ${response.status}` 
        };
      }

      return { success: true };

    } catch (error) {
      console.error('Delete error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete item' 
      };
    }
  }

  // Download result file
  async downloadResult(taskId: string, filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/result/${taskId}`);

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.detail || `Failed to download result: ${response.status}` 
        };
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename.replace(/\.[^/.]+$/, '')}_process_map.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };

    } catch (error) {
      console.error('Download error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to download result' 
      };
    }
  }

  // View visualization in new window
  openVisualization(taskId: string): void {
    const url = `${this.baseUrl}/visualize/${taskId}`;
    window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  }

  // Get task status for real-time updates
  async getTaskStatus(taskId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/status/${taskId}`);

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.detail || `Failed to get status: ${response.status}` 
        };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error('Status fetch error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get task status' 
      };
    }
  }

  // Get health check information
  async getHealthInfo(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);

      if (!response.ok) {
        return { success: false, error: 'Backend not responding' };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error('Health check error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Backend connection failed' 
      };
    }
  }

  // Real-time updates for processing items
  async startPollingProcessingItems(
    onUpdate: (items: HistoryItem[]) => void,
    intervalMs: number = 5000
  ): Promise<() => void> {
    const poll = async () => {
      const historyResult = await this.getHistory();
      if (historyResult.success && historyResult.data) {
        const processingItems = historyResult.data.history.filter(
          item => item.status === 'processing'
        );
        
        if (processingItems.length > 0) {
          // Update processing items with latest status
          const updatedItems = await Promise.all(
            processingItems.map(async (item) => {
              const statusResult = await this.getTaskStatus(item.taskId);
              if (statusResult.success && statusResult.data) {
                return {
                  ...item,
                  status: statusResult.data.status,
                  processCount: statusResult.data.result?.processCount || item.processCount
                };
              }
              return item;
            })
          );
          onUpdate(updatedItems);
        }
      }
    };

    const intervalId = setInterval(poll, intervalMs);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

// Export singleton instance
export const historyApiService = HistoryApiService.getInstance();

// Utility function for handling API responses
export const handleHistoryApiResponse = <T>(
  response: { success: boolean; data?: T; error?: string },
  onSuccess: (data: T) => void,
  onError?: (error: string) => void
): boolean => {
  if (response.success && response.data) {
    onSuccess(response.data);
    return true;
  } else {
    const errorMessage = response.error || 'An unexpected error occurred';
    console.error('History API Error:', errorMessage);
    if (onError) {
      onError(errorMessage);
    }
    return false;
  }
};

// Types export for components
export type {
  HistoryItem,
  HistoryResponse,
  Statistics
};