import { useState } from 'react';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('weight');

  const renderContent = () => {
    switch (activeTab) {
      case 'weight':
        return (
          <div className="glass-card fade-in">
            <h2>⚖️ Weight Tracker Modülü Eklenecek</h2>
            <p>Phase 2 de geliştirilecektir.</p>
          </div>
        );
      case 'fitness':
        return (
          <div className="glass-card fade-in">
            <h2>💪 Fitness Tracker Modülü Eklenecek</h2>
            <p>Phase 3/4 te geliştirilecektir.</p>
          </div>
        );
      case 'finance':
        return (
          <div className="glass-card fade-in">
            <h2>💰 Finance Tracker Modülü Eklenecek</h2>
            <p>Phase 5/6 da geliştirilecektir.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="content-area">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
