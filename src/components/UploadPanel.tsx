import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, FileText, X, CheckCircle, AlertCircle, ArrowLeft, Download, 
   Code, ExternalLink, FileCheck, Map, Wifi, WifiOff, 
  RefreshCw, Brain, Lightbulb, TrendingUp, Shield, Target, Loader2,
  Sparkles, BookOpen, Save, FolderOpen
} from 'lucide-react';

import BpmnEmbeddedVisualizer from './BpmnEmbeddedVisualizer';

interface UploadPanelProps {
  onBack: () => void;
  loadTaskId?: string;
}

interface SavedProcess {
  id: string;
  name: string;
  task_id: string;
  created_at: string;
}

interface ProcessResult {
  found_processes: boolean;
  process_count: number;
  processes: Array<{
    process_name: string;
    process_description: string;
    process_map_bpmn_xml: string;
    subprocesses: Array<any>;
    risk_taxonomy: Array<{
      category: string;
      risk_name: string;
      description: string;
    }>;
    controls: Array<{
      control_name: string;
      control_type: string;
      description: string;
      addresses_risk: string;
      source: string;
    }>;
  }>;
  metadata?: {
    strategy: string;
    processing_time: string;
  };
}

interface ProcessExplanation {
  explanation: string;
  key_insights: string[];
  recommendations: string[];
  complexity_score: number;
}

const UploadPanel: React.FC<UploadPanelProps> = ({ onBack, loadTaskId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [showJsonOutput, setShowJsonOutput] = useState(false);
  const [showBpmnViewer, setShowBpmnViewer] = useState(false);
  const [selectedProcessIndex, setSelectedProcessIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Explanation states
  const [aiExplanations, setAiExplanations] = useState<{ [key: number]: ProcessExplanation }>({});
  const [loadingExplanations, setLoadingExplanations] = useState<{ [key: number]: boolean }>({});
  const [showExplanations, setShowExplanations] = useState<{ [key: number]: boolean }>({});

  // Save functionality states
  const [savedProcesses, setSavedProcesses] = useState<SavedProcess[]>([]);
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const API_BASE = 'http://localhost:8000/api';

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        timeout: 5000,
      });
      setIsBackendConnected(response.ok);
      return response.ok;
    } catch (error) {
      setIsBackendConnected(false);
      return false;
    }
  };

  useEffect(() => {
    testBackendConnection();
    const interval = setInterval(testBackendConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loadTaskId) {
      loadHistoryItem(loadTaskId);
    }
    loadSavedProcesses();
  }, [loadTaskId]);

  const loadSavedProcesses = async () => {
    try {
      const response = await fetch(`${API_BASE}/saved-processes`);
      if (response.ok) {
        const data = await response.json();
        setSavedProcesses(data);
      }
    } catch (err) {
      console.error('Error loading saved processes:', err);
    }
  };

  const loadHistoryItem = async (taskId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/load-history/${taskId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load history item');
      }
      
      const result = await response.json();
      setProcessResult(result);
      setTaskId(taskId);
      
      // Try to find the original filename
      const historyResponse = await fetch(`${API_BASE}/history`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        const item = historyData.history.find((h: any) => h.id === taskId);
        if (item) {
          setFile(new File([], item.name, { type: 'application/octet-stream' }));
        }
      }
      
    } catch (err) {
      console.error('Error loading history item:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history item');
    } finally {
      setLoading(false);
    }
  };

  const saveProcess = async () => {
    if (!processResult || !saveName.trim()) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/save-process/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: saveName.trim() }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Process saved successfully:', result);
        setShowSaveDialog(false);
        setSaveName('');
        await loadSavedProcesses();
        
        setStatus('Process saved successfully!');
        setTimeout(() => setStatus(''), 3000);
      } else {
        throw new Error('Failed to save process');
      }
    } catch (err) {
      console.error('Error saving process:', err);
      setError(err instanceof Error ? err.message : 'Failed to save process');
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedProcess = async (saveId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/saved-process/${saveId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load saved process');
      }
      
      const result = await response.json();
      setProcessResult(result);
      setTaskId(saveId);
      setFile(null);
      
      const savedProcess = savedProcesses.find(sp => sp.id === saveId);
      if (savedProcess) {
        setSaveName(savedProcess.name);
      }
      
    } catch (err) {
      console.error('Error loading saved process:', err);
      setError(err instanceof Error ? err.message : 'Failed to load saved process');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    
    const isValidType = allowedTypes.includes(selectedFile.type) || 
                       allowedExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      setError('Please select a PDF or DOCX file.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    if (!isBackendConnected) {
      const connected = await testBackendConnection();
      if (!connected) {
        setError('Cannot connect to backend server. Please ensure the server is running on http://localhost:8000');
        return;
      }
    }

    setIsUploading(true);
    setError(null);
    setProgress(10);
    setStatus('Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();
      setTaskId(result.task_id);
      setProgress(20);
      setStatus('File uploaded successfully. Starting processing...');
      
      await startProcessing(result.task_id);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setProgress(0);
      setStatus('');
    } finally {
      setIsUploading(false);
    }
  };

  const startProcessing = async (id: string) => {
    setIsProcessing(true);
    setProgress(30);
    setStatus('Starting document analysis...');

    try {
      const response = await fetch(`${API_BASE}/process/${id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Processing failed to start');
      }

      setProgress(40);
      setStatus('Processing started. Analyzing document...');
      
      pollProcessingStatus(id);
    } catch (error) {
      console.error('Processing start error:', error);
      setError(error instanceof Error ? error.message : 'Processing failed');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const pollProcessingStatus = async (id: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/status/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to get status');
        }

        const statusData = await response.json();
        setProgress(statusData.progress);
        setStatus(statusData.detail);

        if (statusData.status === 'completed') {
          clearInterval(pollInterval);
          await fetchResults(id);
          setIsProcessing(false);
        } else if (statusData.status === 'error') {
          clearInterval(pollInterval);
          setError(statusData.error_message || 'Processing failed');
          setIsProcessing(false);
          setProgress(0);
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 2000);

    setTimeout(() => {
      clearInterval(pollInterval);
      if (isProcessing) {
        setError('Processing timeout. Please check your document and try again.');
        setIsProcessing(false);
      }
    }, 10 * 60 * 1000);
  };

  const fetchResults = async (id: string) => {
    try {
      setStatus('Fetching results...');
      const response = await fetch(`${API_BASE}/result-data/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const result = await response.json();
      setProcessResult(result);
      setStatus('Processing completed successfully!');
      setProgress(100);
    } catch (error) {
      console.error('Results fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch results');
    }
  };

  const generateAIExplanation = async (processIndex: number) => {
    if (!processResult?.processes[processIndex]) return;

    const process = processResult.processes[processIndex];
    
    setLoadingExplanations(prev => ({ ...prev, [processIndex]: true }));

    try {
      const response = await fetch(`${API_BASE}/explain-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          process_name: process.process_name,
          process_description: process.process_description,
          risk_taxonomy: process.risk_taxonomy || [],
          controls: process.controls || []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate explanation');
      }

      const explanation = await response.json();
      
      setAiExplanations(prev => ({
        ...prev,
        [processIndex]: explanation
      }));
      
      setShowExplanations(prev => ({
        ...prev,
        [processIndex]: true
      }));

    } catch (error) {
      console.error('AI explanation error:', error);
      
      const fallbackExplanation: ProcessExplanation = {
        explanation: `The ${process.process_name} is a critical business process that involves systematic handling of operations with ${process.risk_taxonomy?.length || 0} identified risks and ${process.controls?.length || 0} control measures. This process requires careful attention to risk management and compliance with established procedures.`,
        key_insights: [
          `Process manages ${process.risk_taxonomy?.length || 0} distinct risk categories`,
          `Has ${process.controls?.length || 0} control measures implemented`,
          'Requires systematic approach for optimal execution',
          'Regular monitoring and review recommended'
        ],
        recommendations: [
          'Conduct regular risk assessments',
          'Test control effectiveness periodically',
          'Consider process automation opportunities',
          'Ensure staff training on updated procedures'
        ],
        complexity_score: Math.min(Math.max(1, (process.risk_taxonomy?.length || 0) + (process.controls?.length || 0)), 10)
      };

      setAiExplanations(prev => ({
        ...prev,
        [processIndex]: fallbackExplanation
      }));
      
      setShowExplanations(prev => ({
        ...prev,
        [processIndex]: true
      }));
    } finally {
      setLoadingExplanations(prev => ({ ...prev, [processIndex]: false }));
    }
  };

  const downloadJson = async () => {
    if (!taskId) return;

    try {
      const response = await fetch(`${API_BASE}/result/${taskId}`);
      
      if (!response.ok) {
        throw new Error('Failed to download JSON');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `process_map_${taskId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Download failed. Please try again.');
    }
  };

  const openVisualization = () => {
    if (!taskId) return;
    const url = `${API_BASE}/visualize/${taskId}`;
    window.open(url, '_blank', 'width=1200,height=800');
  };

  const reset = () => {
    setFile(null);
    setProcessResult(null);
    setTaskId(null);
    setProgress(0);
    setStatus('');
    setShowJsonOutput(false);
    setShowBpmnViewer(false);
    setSelectedProcessIndex(0);
    setError(null);
    setIsUploading(false);
    setIsProcessing(false);
    setAiExplanations({});
    setLoadingExplanations({});
    setShowExplanations({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ConnectionStatus = () => {
    if (isBackendConnected === null) return null;

    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
        isBackendConnected 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isBackendConnected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Connected to backend</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Backend disconnected</span>
            <button
              onClick={testBackendConnection}
              className="ml-2 p-1 hover:bg-red-200 rounded"
              title="Retry connection"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    );
  };

  const AIExplanationModal = ({ processIndex }: { processIndex: number }) => {
    const explanation = aiExplanations[processIndex];
    const process = processResult?.processes[processIndex];
    
    if (!explanation || !process) return null;

    const getComplexityColor = (score: number) => {
      if (score <= 3) return 'text-green-600 bg-green-100';
      if (score <= 7) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    };

    const getComplexityLabel = (score: number) => {
      if (score <= 3) return 'Low';
      if (score <= 7) return 'Medium';
      return 'High';
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6" />
                <div>
                  <h2 className="text-xl font-bold">AI Process Analysis</h2>
                  <p className="text-blue-100">{process.process_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(explanation.complexity_score)}`}>
                  Complexity: {getComplexityLabel(explanation.complexity_score)} ({explanation.complexity_score}/10)
                </div>
                <button
                  onClick={() => setShowExplanations(prev => ({ ...prev, [processIndex]: false }))}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Executive Summary
              </h3>
              <p className="text-blue-800 leading-relaxed whitespace-pre-line">
                {explanation.explanation}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Key Insights
              </h3>
              <ul className="space-y-2">
                {explanation.key_insights.map((insight, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-amber-800">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Strategic Recommendations
              </h3>
              <ul className="space-y-2">
                {explanation.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-800">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Process Analysis Summary
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Risk Profile</h4>
                  <p className="text-gray-700 text-sm mb-2">{process.risk_taxonomy?.length || 0} risks identified</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {process.risk_taxonomy?.slice(0, 3).map((risk, index) => (
                      <div key={index} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {risk.risk_name}
                      </div>
                    ))}
                    {(process.risk_taxonomy?.length || 0) > 3 && (
                      <div className="text-xs text-gray-500">
                        +{(process.risk_taxonomy?.length || 0) - 3} more risks
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Control Framework</h4>
                  <p className="text-gray-700 text-sm mb-2">{process.controls?.length || 0} controls implemented</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {process.controls?.slice(0, 3).map((control, index) => (
                      <div key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {control.control_name}
                      </div>
                    ))}
                    {(process.controls?.length || 0) > 3 && (
                      <div className="text-xs text-gray-500">
                        +{(process.controls?.length || 0) - 3} more controls
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* Left Sidebar for Saved Processes */}
        <div className="w-80 bg-white rounded-xl shadow-lg p-4 self-start">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
            Saved Processes
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {savedProcesses.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">
                No saved processes yet
              </p>
            ) : (
              savedProcesses.map((process) => (
                <div
                  key={process.id}
                  onClick={() => loadSavedProcess(process.id)}
                  className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <h4 className="font-medium text-slate-900 text-sm truncate">
                    {process.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {new Date(process.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
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
                <h1 className="text-2xl font-bold text-slate-900">Upload SOP Document</h1>
                <p className="text-slate-600">Upload your document and generate an intelligent process map</p>
              </div>
            </div>
            
            <ConnectionStatus />
          </div>

          {/* Connection Error Banner */}
          {isBackendConnected === false && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Backend Connection Failed</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Unable to connect to the backend server. Please:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Ensure the backend server is running on <code className="bg-red-100 px-1 rounded">http://localhost:8000</code></li>
                      <li>Check if the server started successfully without errors</li>
                      <li>Verify your firewall settings aren't blocking the connection</li>
                    </ul>
                  </div>
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

          {/* Upload Section */}
          {!processResult && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              {!file ? (
                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Upload your document</h3>
                  <p className="text-slate-600 mb-4">Drag and drop your file here, or click to browse</p>
                  <p className="text-sm text-slate-500">Supports PDF and DOCX files up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">{file.name}</h3>
                  <p className="text-slate-600 mb-4">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  
                  {!isUploading && !isProcessing && (
                    <div className="space-x-4">
                      <button
                        onClick={uploadFile}
                        disabled={!isBackendConnected}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {!isBackendConnected ? 'Backend Disconnected' : 'Generate Process Map'}
                      </button>
                      <button
                        onClick={reset}
                        className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Choose Different File
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Processing Status */}
              {(isUploading || isProcessing) && (
                <div className="mt-8 text-center">
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-slate-600 mb-2">
                    {isUploading ? 'Uploading...' : 'Processing document...'}
                  </p>
                  <p className="text-sm text-slate-500">{status}</p>
                  <div className="flex items-center justify-center mt-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-slate-600">
                      {progress}% complete
                    </span>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800">Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    <div className="mt-3 space-x-2">
                      <button
                        onClick={reset}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors text-sm"
                      >
                        Try Again
                      </button>
                      {!isBackendConnected && (
                        <button
                          onClick={testBackendConnection}
                          className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors text-sm"
                        >
                          Test Connection
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {processResult && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Process Map Generated Successfully!
                    </h3>
                    <div className="text-green-800 space-y-1">
                      <p>✅ Found {processResult.process_count} business processes</p>
                      <p>✅ Extracted {processResult.processes.reduce((acc, p) => acc + (p.risk_taxonomy?.length || 0), 0)} risks</p>
                      <p>✅ Generated {processResult.processes.reduce((acc, p) => acc + (p.controls?.length || 0), 0)} controls</p>
                      <p>✅ Created complete BPMN XML diagrams</p>
                      <p>✅ AI explanations available for each process</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Process
                </button>
                
                <button
                  onClick={() => setShowJsonOutput(!showJsonOutput)}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <FileCheck className="h-5 w-5 mr-2" />
                  {showJsonOutput ? 'Hide' : 'Show'} JSON Output
                </button>
                
                <button
                  onClick={() => setShowBpmnViewer(!showBpmnViewer)}
                  className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Map className="h-5 w-5 mr-2" />
                  View BPMN Flowchart
                </button>

                <button
                  onClick={downloadJson}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download JSON
                </button>

                <button
                  onClick={openVisualization}
                  className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Open Full Visualization
                </button>

                <button
                  onClick={reset}
                  className="flex items-center px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Process Another Document
                </button>
              </div>

              {/* Save Dialog */}
              {showSaveDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      Save Process
                    </h3>
                    
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="Enter process name"
                      className="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowSaveDialog(false)}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={saveProcess}
                        disabled={!saveName.trim() || isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* JSON Output Display */}
              {showJsonOutput && (
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Code className="h-5 w-5 mr-2 text-green-600" />
                      JSON Output
                    </h3>
                    <button
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(processResult, null, 2))}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                    >
                      Copy JSON
                    </button>
                  </div>
                  <div className="bg-gray-900 text-green-400 rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(processResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* BPMN Viewer */}
              {showBpmnViewer && processResult.processes.length > 0 && (
                <div className="space-y-4">
                  {/* Process Selector */}
                  {processResult.processes.length > 1 && (
                    <div className="bg-white border border-gray-300 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Process to View:
                      </label>
                      <select
                        value={selectedProcessIndex}
                        onChange={(e) => setSelectedProcessIndex(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {processResult.processes.map((process, index) => (
                          <option key={index} value={index}>
                            {process.process_name || `Process ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Embedded BPMN Visualizer */}
                  <BpmnEmbeddedVisualizer
                    bpmnXml={processResult.processes[selectedProcessIndex]?.process_map_bpmn_xml || ''}
                    processName={processResult.processes[selectedProcessIndex]?.process_name || `Process ${selectedProcessIndex + 1}`}
                    onClose={() => setShowBpmnViewer(false)}
                    height={600}
                  />
                </div>
              )}

              {/* Process Details with AI Explanation */}
              <div className="grid gap-6">
                {processResult.processes.map((process, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {process.process_name || `Process ${index + 1}`}
                        </h3>
                        <p className="text-gray-600">{process.process_description}</p>
                      </div>
                      
                      {/* AI Explanation Button */}
                      <button
                        onClick={() => generateAIExplanation(index)}
                        disabled={loadingExplanations[index]}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                          aiExplanations[index] 
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        }`}
                      >
                        {loadingExplanations[index] ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : aiExplanations[index] ? (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            View AI Analysis
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            Generate AI Explanation
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                          Risks ({process.risk_taxonomy?.length || 0})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {process.risk_taxonomy?.map((risk, riskIndex) => (
                            <div key={riskIndex} className="p-3 bg-red-50 border border-red-200 rounded">
                              <p className="font-medium text-red-900 text-sm">{risk.risk_name}</p>
                              <p className="text-red-700 text-xs mt-1">{risk.category}</p>
                              {risk.description && (
                                <p className="text-red-600 text-xs mt-1">{risk.description}</p>
                              )}
                            </div>
                          )) || <p className="text-gray-500 text-sm">No risks identified</p>}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Controls ({process.controls?.length || 0})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {process.controls?.map((control, controlIndex) => (
                            <div key={controlIndex} className="p-3 bg-green-50 border border-green-200 rounded">
                              <p className="font-medium text-green-900 text-sm">{control.control_name}</p>
                              <p className="text-green-700 text-xs mt-1">
                                {control.control_type} - {control.source}
                              </p>
                              {control.description && (
                                <p className="text-green-600 text-xs mt-1">{control.description}</p>
                              )}
                              {control.addresses_risk && (
                                <p className="text-green-600 text-xs mt-1 font-medium">
                                  Addresses: {control.addresses_risk}
                                </p>
                              )}
                            </div>
                          )) || <p className="text-gray-500 text-sm">No controls identified</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Explanation Modals */}
      {Object.entries(showExplanations).map(([processIndex, show]) => 
        show && <AIExplanationModal key={processIndex} processIndex={parseInt(processIndex)} />
      )}
    </div>
  );
};

export default UploadPanel;