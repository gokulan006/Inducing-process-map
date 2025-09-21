import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, FileText, Calendar, Download, Search, Filter, 
  Trash2, RefreshCw, AlertCircle, CheckCircle, Clock, X, ExternalLink,
  Loader2, Wifi, WifiOff, Archive, TrendingUp, BarChart3
} from 'lucide-react';

interface HistoryPanelProps {
  onBack: () => void;
}

interface HistoryItem {
  id: string;
  name: string;
  processCount: number;
  generatedDate: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  type: string;
  size?: number;
  taskId: string;
}

interface HistoryResponse {
  history: HistoryItem[];
  total: number;
  filtered: number;
}

interface Statistics {
  totalDocuments: number;
  completedDocuments: number;
  processingDocuments: number;
  errorDocuments: number;
  totalProcessesExtracted: number;
  successRate: number;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const API_BASE = 'http://localhost:8000/api';

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      setIsBackendConnected(response.ok);
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      setIsBackendConnected(false);
      return false;
    }
  };

  // Fetch history from backend
  const fetchHistory = async (search?: string, filterType?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      if (filterType && filterType !== 'all') {
        params.append('filter_type', filterType);
      }

      const url = `${API_BASE}/history${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }

      const data: HistoryResponse = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      if (response.ok) {
        const data: Statistics = await response.json();
        setStatistics(data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  // Delete history item
  const deleteHistoryItem = async (taskId: string) => {
    try {
      setDeletingIds(prev => new Set([...prev, taskId]));

      const response = await fetch(`${API_BASE}/history/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Remove from local state
      setHistory(prev => prev.filter(item => item.id !== taskId));
      
      // Refresh statistics
      await fetchStatistics();

      // Show success message (you could add a toast notification here)
      console.log('Item deleted successfully');
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  // Download result
  const downloadResult = async (taskId: string, filename: string) => {
    try {
      const response = await fetch(`${API_BASE}/result/${taskId}`);
      
      if (!response.ok) {
        throw new Error('Failed to download result');
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
    } catch (err) {
      console.error('Error downloading result:', err);
      setError(err instanceof Error ? err.message : 'Failed to download result');
    }
  };

  // View visualization
  const viewVisualization = (taskId: string) => {
    const url = `${API_BASE}/visualize/${taskId}`;
    window.open(url, '_blank', 'width=1200,height=800');
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      testBackendConnection(),
      fetchHistory(searchTerm, filterType),
      fetchStatistics(),
    ]);
    setRefreshing(false);
  };

  // Initial load and connection test
  useEffect(() => {
    const initializeData = async () => {
      await testBackendConnection();
      await Promise.all([
        fetchHistory(),
        fetchStatistics(),
      ]);
    };

    initializeData();
  }, []);

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchHistory(searchTerm, filterType);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterType]);

  // Get status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'uploaded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'uploaded':
        return <Archive className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = history.slice(startIndex, endIndex);

  // Connection Status Component
  const ConnectionStatus = () => {
    if (isBackendConnected === null) return null;

    return (
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
        isBackendConnected 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isBackendConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Offline</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center text-slate-600 hover:text-slate-800 transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Process Map History</h1>
              <p className="text-slate-600">View and manage your generated process maps</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-white hover:bg-opacity-80 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <ConnectionStatus />
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalDocuments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.completedDocuments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processes Extracted</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalProcessesExtracted}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.successRate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connection Error Banner */}
        {isBackendConnected === false && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Backend Connection Failed</h3>
                <p className="mt-2 text-sm text-red-700">
                  Unable to connect to the backend server. History data may not be available.
                </p>
                <div className="mt-4">
                  <button
                    onClick={testBackendConnection}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
                  >
                    Test Connection Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg">
          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[140px]"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDF Files</option>
                  <option value="docx">DOCX Files</option>
                  <option value="doc">DOC Files</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {loading ? 'Loading...' : `${history.length} documents found`}
              </p>
            </div>
          </div>

          {/* History List */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600">Loading history...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading History</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={refreshData}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="p-12 text-center">
                <Archive className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No documents found</h3>
                <p className="text-slate-600">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Upload your first document to see it here'
                  }
                </p>
              </div>
            ) : (
              currentItems.map((item) => (
                <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-slate-900 truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-slate-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(item.generatedDate)}
                          </div>
                          <div className="text-sm text-slate-600">
                            {item.processCount} processes found
                          </div>
                          <div className="text-sm text-slate-600">
                            {formatFileSize(item.size)}
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1 capitalize">{item.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {item.status === 'completed' && (
                        <>
                          <button
                            onClick={() => viewVisualization(item.taskId)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Visualization"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => downloadResult(item.taskId, item.name)}
                            className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download Results"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => deleteHistoryItem(item.taskId)}
                        disabled={deletingIds.has(item.taskId)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingIds.has(item.taskId) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, history.length)} of {history.length} documents
                </p>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;