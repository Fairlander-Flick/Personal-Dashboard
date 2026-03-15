import { useState } from 'react';
import Navbar from './components/Navbar';
import Overview from './components/Overview';
import BodyTracker from './components/BodyTracker';
import Budgeting from './components/Budgeting';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview setActiveTab={setActiveTab} />;
      case 'weight':
        return <BodyTracker />;
      case 'budgeting':
        return <Budgeting />;
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
