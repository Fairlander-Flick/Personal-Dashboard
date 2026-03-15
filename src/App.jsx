import { useState } from 'react';
import Navbar from './components/Navbar';
import Overview from './components/Overview';
import Fitness from './components/Fitness';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview setActiveTab={setActiveTab} />;
      case 'fitness':
        return <Fitness />;
      case 'finance':
        return (
          <div className="glass-card fade-in placeholder-card">
            <h2>💰 Finance Tracker</h2>
            <p>Expense logging and reports — coming in Phase 4.</p>
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
