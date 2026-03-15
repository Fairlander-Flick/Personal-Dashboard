import React from 'react';
import './Overview.css';

export default function Overview({ setActiveTab }) {
  const summaryCards = [
    {
      id: 'fitness',
      icon: '💪',
      title: 'Fitness & Vücut',
      subtitle: 'Son kilo & idman özeti',
      color: 'var(--primary)',
      glow: 'var(--primary-glow)',
      stats: [
        { label: 'Son Kilo', value: '—', unit: 'kg' },
        { label: 'Son İdman', value: '—', unit: '' },
      ],
    },
    {
      id: 'finance',
      icon: '💰',
      title: 'Finans',
      subtitle: 'Bu ayın harcama özeti',
      color: 'var(--accent)',
      glow: 'var(--accent-glow)',
      stats: [
        { label: 'Bu Ay', value: '—', unit: '₺' },
        { label: 'En Çok', value: '—', unit: '' },
      ],
    },
  ];

  return (
    <div className="overview-wrapper fade-in">
      <div className="overview-header">
        <h1 className="overview-title">Merhaba 👋</h1>
        <p className="overview-date">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
        <p>Üst menüden bir sekme seçerek detaylara geçebilirsin.</p>
      </div>
    </div>
  );
}
