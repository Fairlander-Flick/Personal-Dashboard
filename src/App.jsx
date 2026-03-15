import { useState } from 'react';
import Navbar from './components/Navbar';
import Overview from './components/Overview';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview setActiveTab={setActiveTab} />;
      case 'fitness':
        return (
          <div className="glass-card fade-in placeholder-card">
            <h2>💪 Fitness & Vücut Takibi</h2>
            <p>Kilo, idman ve egzersiz logu — Phase 2'de gelecek.</p>
          </div>
        );
      case 'finance':
        return (
          <div className="glass-card fade-in placeholder-card">
            <h2>💰 Finans Takibi</h2>
            <p>Harcama kayıtları ve raporlar — Phase 4'te gelecek.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow bg-glow-3" />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="content-area">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
