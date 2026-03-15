import React from 'react';
import './Navbar.css';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'weight', label: 'Weight', icon: '⚖️' },
    { id: 'budgeting', label: 'Budgeting', icon: '💰' },
  ];

  return (
    <nav className="glass-card navbar fade-in">
      <div className="navbar-logo">
        <span className="logo-icon">🚀</span>
        <span className="logo-text">Astra Dash</span>
      </div>
      <div className="navbar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
