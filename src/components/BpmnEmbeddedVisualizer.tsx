import React, { useState, useEffect, useRef } from 'react';

interface BpmnViewerProps {
  bpmnXml: string;
  processName: string;
}

const BpmnEmbeddedVisualizer : React.FC<BpmnViewerProps> = ({ bpmnXml, processName }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setError('');
    
    if (!bpmnXml) {
      setError('No BPMN XML provided');
      setIsLoading(false);
      return;
    }

    try {
      // In a real implementation, you would parse the BPMN XML and render it
      // For this example, we'll simulate rendering with a placeholder
      setTimeout(() => {
        setSvgContent(`
          <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f8fafc" />
            <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="16" fill="#374151">
              BPMN Diagram for ${processName}
            </text>
            <circle cx="200" cy="150" r="80" stroke="#3b82f6" stroke-width="2" fill="none" />
            <circle cx="200" cy="150" r="30" stroke="#6366f1" stroke-width="2" fill="none" />
          </svg>
        `);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to render BPMN diagram');
      setIsLoading(false);
    }
  }, [bpmnXml, processName]);

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{processName} - Process Flow</h3>
      </div>
      
      <div 
        ref={containerRef}
        className="flex-1 p-6 flex items-center justify-center overflow-auto relative"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-600">Loading BPMN diagram...</p>
          </div>
        ) : error ? (
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200 max-w-md">
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h4 className="font-medium text-red-800 mb-1">Unable to display diagram</h4>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : (
          <div 
            className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500 flex justify-between items-center">
        <span>BPMN 2.0 Process Diagram</span>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Zoom In
          </button>
          <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Zoom Out
          </button>
          <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Reset View
          </button>
        </div>
      </div>
    </div>
  );
};

// Example usage component
const ProcessMapperApp = () => {
  const [selectedProcessIndex, setSelectedProcessIndex] = useState(0);
  const [processResult] = useState({
    processes: [
      {
        process_name: "Invoice Processing",
        process_map_bpmn_xml: "<?xml version='1.0' encoding='UTF-8'?><bpmn:definitions>...</bpmn:definitions>"
      },
      {
        process_name: "Vendor Onboarding",
        process_map_bpmn_xml: "<?xml version='1.0' encoding='UTF-8'?><bpmn:definitions>...</bpmn:definitions>"
      }
    ]
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Process Mapper</h1>
        
        <div className="flex mb-4 space-x-3">
          {processResult.processes.map((process, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-lg ${
                selectedProcessIndex === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setSelectedProcessIndex(index)}
            >
              {process.process_name}
            </button>
          ))}
        </div>
        
        <div className="h-96 border rounded-lg overflow-hidden">
          <BpmnViewer
            bpmnXml={processResult.processes[selectedProcessIndex]?.process_map_bpmn_xml || ''}
            processName={processResult.processes[selectedProcessIndex]?.process_name || `Process ${selectedProcessIndex + 1}`}
          />
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800">Tips for viewing BPMN diagrams:</h3>
          <ul className="list-disc list-inside text-blue-600 mt-2 text-sm">
            <li>Use the zoom buttons to adjust the diagram size</li>
            <li>Drag the diagram to navigate when zoomed in</li>
            <li>Rectangles represent activities or tasks</li>
            <li>Diamonds represent decision points</li>
            <li>Circles represent start and end events</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BpmnEmbeddedVisualizer;