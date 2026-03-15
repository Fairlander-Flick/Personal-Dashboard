import React from 'react';
import './Overview.css';

export default function Overview({ setActiveTab }) {
  // Read actual data from LocalStorage to show on the cards
  const readStorage = (key) => {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  };

  const weights = readStorage('astra_body_data').sort((a,b) => new Date(b.date) - new Date(a.date));
  const expenses = readStorage('astra_budget');

  // Weight Stats
  const lastWeight = weights.length > 0 ? weights[0].weight : '—';
  
  // Budget Stats for current month
  const currentMonthNum = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() === currentMonthNum && d.getFullYear() === currentYear;
  });

  const totalSpentThisMonth = currentMonthExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  
  // Find top category this month
  const categoryTotals = {};
  currentMonthExpenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  
  let topCategory = '—';
  let maxCatAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > maxCatAmount) {
      topCategory = cat;
      maxCatAmount = amt;
    }
  }

  const summaryCards = [
    {
      id: 'weight',
      icon: '⚖️',
      title: 'Weight Tracker',
      subtitle: 'Latest weight & trend',
      color: 'var(--primary)',
      glow: 'var(--primary-glow)',
      stats: [
        { label: 'Last Weight', value: lastWeight, unit: 'kg' },
        { label: 'Log Count', value: weights.length, unit: '' },
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
        { label: 'This Month', value: totalSpentThisMonth > 0 ? totalSpentThisMonth.toLocaleString('tr-TR') : '—', unit: '₺' },
        { label: 'Top Spend', value: topCategory, unit: '' },
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
