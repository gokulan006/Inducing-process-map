# ProcessMapper AI 

> *Transform your Standard Operating Procedures into Interactive Process Maps with AI-powered analysis*

[![Made with React](https://img.shields.io/badge/Frontend-React%2018-blue.svg)](https://reactjs.org/)
[![Made with FastAPI](https://img.shields.io/badge/Backend-FastAPI-green.svg)](https://fastapi.tiangolo.com/)
[![AI Powered](https://img.shields.io/badge/AI-OpenAI%20GPT--4o--mini-orange.svg)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

##  Overview

ProcessMapper AI is a cutting-edge business process management platform that leverages **Large Language Models (LLMs)** to automatically extract, analyze, and visualize business processes from Standard Operating Procedures (SOPs). The system combines modern web technologies with advanced AI to deliver intelligent process mapping and risk analysis.

##  Key Features & Innovations

###  AI-Powered Process Intelligence
- **LLM Integration**: Utilizes OpenAI's GPT-4o-mini for natural language understanding and process extraction
- **Intelligent Document Analysis**: Automatically detects and extracts business processes from unstructured documents
- **Smart Process Recognition**: Adapts to various SOP formats and automatically identifies process boundaries
- **Risk & Control Detection**: AI identifies potential risks and suggests appropriate control measures

###  Modern User Interface with LLM Enhancement
- **AI Chat Assistant**: Built-in intelligent chatbot to guide users through platform features
- **Contextual Help**: LLM-powered assistance that understands user intent and provides relevant guidance
- **Interactive Process Visualization**: Dynamic BPMN diagrams with real-time interaction
- **Responsive Design**: Modern React + TypeScript + Tailwind CSS implementation

###  Advanced Process Management
- **BPMN 2.0 Compliance**: Generates industry-standard Business Process Model and Notation XML
- **Multi-format Support**: Handles PDF, DOCX, DOC, and TXT document formats
- **Process Persistence**: Save and retrieve processed analyses with custom naming
- **Historical Analytics**: Comprehensive history panel with search and filter capabilities

###  Enterprise-Grade Features
- **Risk Taxonomy Classification**: Categorizes risks (Operational, Compliance, Fraud, etc.)
- **Control Framework Integration**: Maps controls to specific risks with effectiveness ratings
- **Real-time Processing**: Background task processing with live progress updates
- **Data Persistence**: SQLite database for reliable data storage and retrieval

## Architecture & Technology Stack

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   AI Services   │
│                 │    │                  │    │                 │
│ • React 18      │───▶│ • FastAPI        │───▶│ • OpenAI API    │
│ • TypeScript    │    │ • Python 3.9+    │    │ • GPT-4o-mini   │
│ • Tailwind CSS  │    │ • SQLite         │    │ • NLP Analysis  │
│ • Vite          │    │ • Pydantic       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Frontend Technologies
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for modern, responsive UI design
- **Vite** for fast development and optimized builds
- **Lucide React** for consistent iconography
- **Real-time Updates** with polling and WebSocket-ready architecture

### Backend Technologies
- **FastAPI** for high-performance async API development
- **SQLite** for embedded database functionality
- **Pydantic** for data validation and serialization
- **OpenAI API Integration** for LLM-powered analysis
- **Background Tasks** for non-blocking document processing

##  Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** 3.9+
- **OpenAI API Key** (for AI features)

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/processmapper-ai.git
cd processmapper-ai
```

#### 2. Backend Setup
```bash
cd Backend
pip install -r requirements.txt

# Set up environment variables
export OPENAI_API_KEY="your-openai-api-key"

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

#### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Key Concepts & Terminology

| Term | Description |
|------|-------------|
| **SOP** | Standard Operating Procedure - business process documentation |
| **BPMN** | Business Process Model and Notation - industry standard for process visualization |
| **Process Map** | Visual representation of a business process flow |
| **Risk Taxonomy** | Categorized classification of potential business risks |
| **Control Framework** | Set of measures designed to mitigate identified risks |
| **Task ID** | Unique identifier for each document processing job |
| **LLM** | Large Language Model - AI system for natural language processing |
| **Process Extraction** | AI-powered identification of business processes from documents |

##  Core Features Deep Dive

### 1. Document Processing Pipeline
```
Upload → Text Extraction → AI Analysis → Process Mapping → Visualization
```

### 2. AI-Powered Analysis
- **Flexible Process Detection**: Automatically adapts to different document structures
- **Risk Identification**: Scans for potential operational, compliance, and fraud risks  
- **Control Mapping**: Links control measures to specific risk categories
- **BPMN Generation**: Creates valid XML for process visualization tools

### 3. User Experience Enhancements
- **Progress Tracking**: Real-time updates during document processing
- **Error Handling**: Comprehensive error messages with suggested solutions
- **Save & Resume**: Persistent storage for process analyses
- **Search & Filter**: Advanced history management capabilities

### 4. LLM Integration Points
- **Document Analysis**: GPT-4o-mini processes unstructured text
- **Process Explanation**: AI generates business-friendly process descriptions
- **Chat Assistant**: Real-time user support and guidance
- **Risk Assessment**: Intelligent risk categorization and control suggestions

##  Project Structure

```
processmapper-ai/
├── Backend/                    # FastAPI backend application
│   ├── main.py                # Main application entry point
│   ├── requirements.txt       # Python dependencies
│   └── uploads/               # Document storage directory
├── src/                       # React frontend source code
│   ├── components/            # Reusable React components
│   ├── UploadPanel.tsx       # Document upload interface
│   ├── HistoryPanel.tsx      # Process history management
│   ├── ChatAssistant.tsx     # LLM-powered chat interface
│   └── BpmnDiagramViewer.tsx # Process visualization component
├── public/                    # Static assets
├── package.json              # Frontend dependencies
├── tailwind.config.js        # Tailwind CSS configuration
├── vite.config.ts           # Vite build configuration
└── README.md                # This file
```

##  Deployment Options

### Local Development
```bash
# Backend
cd Backend && uvicorn main:app --reload

# Frontend  
npm run dev
```

### Production Build
```bash
# Frontend build
npm run build

# Serve built files
npm run preview
```

### Docker Deployment (Coming Soon)
```bash
docker-compose up -d
```

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload SOP document |
| `POST` | `/api/process/{task_id}` | Start document processing |
| `GET` | `/api/status/{task_id}` | Get processing status |
| `GET` | `/api/result-data/{task_id}` | Get process analysis results |
| `POST` | `/api/save-process/{task_id}` | Save processed results |
| `GET` | `/api/saved-processes` | List saved processes |
| `POST` | `/api/chat` | Chat with AI assistant |
| `GET` | `/api/history` | Get processing history |

##  Use Cases

### Enterprise Process Management
- **Compliance Documentation**: Automate compliance process mapping
- **Process Standardization**: Ensure consistent process documentation
- **Risk Assessment**: Identify and mitigate operational risks
- **Audit Preparation**: Generate audit-ready process documentation

### Business Process Optimization
- **Workflow Analysis**: Identify bottlenecks and inefficiencies
- **Process Automation**: Map processes for RPA implementation
- **Training Documentation**: Create visual training materials
- **Knowledge Management**: Centralize process knowledge
 
##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **OpenAI** for providing advanced LLM capabilities
- **FastAPI** community for excellent async Python framework
- **React** team for the robust frontend framework
- **Tailwind CSS** for the utility-first CSS framework


---

**Made with ❤️ by the ProcessMapper AI Team**

*Transforming business processes, one document at a time.*
