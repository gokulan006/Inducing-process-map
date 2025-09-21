import React from 'react';
import { Upload, History, FileText, Zap, Shield, Target, ArrowRight } from 'lucide-react';
interface HomePageProps {
  onShowUpload: () => void;
  onShowHistory: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onShowUpload, onShowHistory }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">ProcessMapper AI</h1>
                <p className="text-sm text-slate-600">Intelligent SOP Analysis & Visualization</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Transform Your SOPs into
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {" "}Interactive Process Maps
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Upload your Standard Operating Procedures and instantly generate comprehensive process maps 
            with risk analysis, controls identification, and BPMN visualization powered by advanced AI.
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onShowUpload}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 min-w-[240px]"
            >
              <Upload className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              <span>Upload SOP Document</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={onShowHistory}
              className="group bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 border border-slate-200 hover:border-slate-300 min-w-[240px]"
            >
              <History className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              <span>View History</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">AI-Powered Analysis</h3>
            <p className="text-slate-600 leading-relaxed">
              Advanced natural language processing extracts processes, identifies decision points, 
              and maps complex workflows automatically from your documents.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Risk & Controls</h3>
            <p className="text-slate-600 leading-relaxed">
              Automatically identifies potential risks within processes and suggests appropriate 
              controls and mitigation strategies for comprehensive governance.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">BPMN Visualization</h3>
            <p className="text-slate-600 leading-relaxed">
              Generate industry-standard BPMN process maps that can be imported into 
              your existing process management tools and platforms.
            </p>
          </div>
        </div>

        {/* Process Flow Preview */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">How It Works</h3>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-8">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Upload Document</h4>
              <p className="text-sm text-slate-600">Upload your SOP in PDF or DOCX format</p>
            </div>
            
            <div className="hidden md:block">
              <ArrowRight className="h-6 w-6 text-slate-400" />
            </div>
            
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">AI Analysis</h4>
              <p className="text-sm text-slate-600">Our AI extracts and analyzes processes</p>
            </div>
            
            <div className="hidden md:block">
              <ArrowRight className="h-6 w-6 text-slate-400" />
            </div>
            
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Generate Map</h4>
              <p className="text-sm text-slate-600">Receive interactive process visualization</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;