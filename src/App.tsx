import React, { useState } from 'react';
import HomePage from './components/HomePage';
import UploadPanel from './components/UploadPanel';
import HistoryPanel from './components/HistoryPanel';
import ChatAssistant from './components/ChatAssistant';

type View = 'home' | 'upload' | 'history';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'upload':
        return <UploadPanel onBack={() => setCurrentView('home')} />;
      case 'history':
        return <HistoryPanel onBack={() => setCurrentView('home')} />;
      default:
        return (
          <HomePage
            onShowUpload={() => setCurrentView('upload')}
            onShowHistory={() => setCurrentView('history')}
          />
        );
    }
  };

  return (
    <div className="relative">
      {renderCurrentView()}
      <ChatAssistant />
    </div>
  );
}

export default App;