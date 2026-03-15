import React from 'react';
import './Overview.css';

export default function Overview({ setActiveTab }) {
  const summaryCards = [
    {
      id: 'weight',
      icon: '⚖️',
      title: 'Weight Tracker',
      subtitle: 'Latest weight & trend',
      color: 'var(--primary)',
      glow: 'var(--primary-glow)',
      stats: [
        { label: 'Last Weight', value: '—', unit: 'kg' },
        { label: 'Last Workout', value: '—', unit: '' },
      ],
    },
    {
      id: 'budgeting',
      icon: '💰',
      title: 'Budgeting',
      subtitle: 'This month\'s spending',
      color: 'var(--accent)',
      glow: 'var(--accent-glow)',
      stats: [
        { label: 'This Month', value: '—', unit: '$' },
        { label: 'Top Spend', value: '—', unit: '' },
      ],
    },
  ];

  return (
    <div className="overview-wrapper fade-in">
      <div className="overview-header">
        <h1 className="overview-title">Welcome back 👋</h1>
        <p className="overview-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="overview-cards">
        {summaryCards.map((card) => (
          <button
            key={card.id}
            className="overview-card glass-card"
            style={{ '--card-color': card.color, '--card-glow': card.glow }}
            onClick={() => setActiveTab(card.id)}
          >
            <div className="card-header">
              <span className="card-icon">{card.icon}</span>
              <div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-subtitle">{card.subtitle}</p>
              </div>
            </div>
            <div className="card-stats">
              {card.stats.map((stat) => (
                <div key={stat.label} className="stat-item">
                  <span className="stat-value">{stat.value} <small>{stat.unit}</small></span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
            <div className="card-arrow">→</div>
          </button>
        ))}
      </div>

      <div className="overview-tip glass-card">
        <span>💡</span>
        <p>Select a tab from the top menu to view detailed logs and statistics.</p>
      </div>
    </div>
  );
}
