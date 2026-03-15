import React, { useState, useEffect } from 'react';
import './Budgeting.css';

const STORAGE_KEY = 'astra_budget';

function getInitialData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

const CATEGORIES = {
  'Groceries': { icon: '🛒', color: '#10b981' },
  'Dining': { icon: '🍽️', color: '#f59e0b' },
  'Transport': { icon: '🚗', color: '#3b82f6' },
  'Entertainment': { icon: '🎬', color: '#8b5cf6' },
  'Personal Care': { icon: '💅', color: '#ec4899' },
  'Bills': { icon: '📄', color: '#ef4444' },
  'Shopping': { icon: '🛍️', color: '#0ea5e9' },
  'Other': { icon: '📦', color: '#94a3b8' },
};

// Smart Dictionary for auto-categorization
const SMART_DICTIONARY = {
  'migros': 'Groceries',
  'carrefour': 'Groceries',
  'bim': 'Groceries',
  'a101': 'Groceries',
  'sok': 'Groceries',
  'uber': 'Transport',
  'bitaksi': 'Transport',
  'marti': 'Transport',
  'shell': 'Transport',
  'opet': 'Transport',
  'starbucks': 'Dining',
  'yemeksepeti': 'Dining',
  'getir': 'Dining',
  'mcdonalds': 'Dining',
  'burger king': 'Dining',
  'netflix': 'Entertainment',
  'spotify': 'Entertainment',
  'steam': 'Entertainment',
  'sinema': 'Entertainment',
  'watsons': 'Personal Care',
  'gratis': 'Personal Care',
  'rossmann': 'Personal Care',
  'zara': 'Shopping',
  'h&m': 'Shopping',
  'trendyol': 'Shopping',
  'hepsiburada': 'Shopping',
  'amazon': 'Shopping',
  'turkcell': 'Bills',
  'vodafone': 'Bills',
  'igdas': 'Bills',
  'tedas': 'Bills',
};

import { getSettings } from './Settings';

export default function Budgeting() {
  const [expenses, setExpenses] = useState(getInitialData);
  const { currency, monthlyLimit } = getSettings();
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Other');
  const [editingId, setEditingId] = useState(null);
  
  // Auto-categorize based on description input
  useEffect(() => {
    if (editingId) return; // Don't auto-change while editing
    const lowerDesc = desc.toLowerCase();
    for (const [key, cat] of Object.entries(SMART_DICTIONARY)) {
      if (lowerDesc.includes(key)) {
        setCategory(cat);
        return;
      }
    }
  }, [desc, editingId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !desc || !date) return;

    if (editingId) {
      setExpenses(prev =>
        prev.map(exp =>
          exp.id === editingId
            ? { ...exp, amount: parseFloat(amount), desc, date, category }
            : exp
        ).sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      setEditingId(null);
    } else {
      const newExp = {
        id: Date.now(),
        date,
        amount: parseFloat(amount),
        desc,
        category,
      };
      setExpenses(prev => [newExp, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    }

    setAmount('');
    setDesc('');
    setCategory('Other');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleEdit = (exp) => {
    setEditingId(exp.id);
    setAmount(String(exp.amount));
    setDesc(exp.desc);
    setCategory(exp.category);
    setDate(exp.date);
  };

  const handleDelete = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (editingId === id) handleCancel();
  };

  const handleCancel = () => {
    setEditingId(null);
    setAmount('');
    setDesc('');
    setCategory('Other');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // Calculations for current month
  const currentMonthNum = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() === currentMonthNum && d.getFullYear() === currentYear;
  });

  const totalSpentThisMonth = currentMonthExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  const budgetPercentage = Math.min((totalSpentThisMonth / monthlyLimit) * 100, 100);
  
  let barColor = 'var(--primary)';
  if (budgetPercentage >= 90) barColor = 'var(--danger)';
  else if (budgetPercentage >= 80) barColor = 'var(--warning)';

  return (
    <div className="budgeting-module fade-in">
      {/* Budget Warning Bar */}
      <div className="glass-card budget-summary">
        <div className="budget-header">
          <div>
            <h3 className="section-title" style={{marginBottom: '0.2rem'}}>This Month's Spending</h3>
            <p className="budget-subtitle">
              <span className="spent-val">{currency}{totalSpentThisMonth.toLocaleString('en-US')}</span> 
              <span className="limit-val"> / {currency}{monthlyLimit.toLocaleString('en-US')}</span>
            </p>
          </div>
          <div className="budget-percentage" style={{color: barColor}}>{budgetPercentage.toFixed(0)}%</div>
        </div>
        
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${budgetPercentage}%`, backgroundColor: barColor }} 
          />
        </div>
        {budgetPercentage >= 90 && <p className="budget-alert over-limit">⚠️ Critical: Approaching monthly limit!</p>}
        {budgetPercentage >= 80 && budgetPercentage < 90 && <p className="budget-alert warning">⚠️ Warning: Over 80% of monthly budget used.</p>}
      </div>

      {/* Entry Form */}
      <form className="glass-card budget-form fade-in" onSubmit={handleSubmit}>
        <h3 className="form-title">{editingId ? '✏️ Edit Expense' : '💸 Log Expense'}</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Amount ({currency})</label>
            <input
              type="number" step="0.01" min="0" placeholder="e.g. 150"
              value={amount} onChange={e => setAmount(e.target.value)} required
            />
          </div>
          <div className="form-group" style={{flex: 2}}>
            <label>Description</label>
            <input
              type="text" placeholder="e.g. Migros grocery shop"
              value={desc} onChange={e => setDesc(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {Object.keys(CATEGORIES).map(cat => (
                <option key={cat} value={cat}>{CATEGORIES[cat].icon} {cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions" style={{marginTop: '0.5rem'}}>
          <button type="submit" className="btn-primary">
            {editingId ? '💾 Update' : '+ Add Expense'}
          </button>
          {editingId && <button type="button" className="btn-ghost" onClick={handleCancel}>Cancel</button>}
        </div>
      </form>

      {/* Recent History List */}
      {expenses.length > 0 && (
        <div className="glass-card fade-in">
          <h3 className="section-title">🕒 Recent Transactions</h3>
          <div className="expense-list">
            {expenses.slice(0, 50).map((exp) => (
              <div key={exp.id} className="expense-item">
                <div className="exp-icon-box" style={{ backgroundColor: CATEGORIES[exp.category]?.color + '20', color: CATEGORIES[exp.category]?.color }}>
                  {CATEGORIES[exp.category]?.icon || '📦'}
                </div>
                <div className="exp-info">
                  <span className="exp-desc">{exp.desc}</span>
                  <div className="exp-meta">
                    <span className="exp-cat" style={{ color: CATEGORIES[exp.category]?.color }}>{exp.category}</span>
                    <span className="exp-dot">•</span>
                    <span className="exp-date">{new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
                <div className="exp-right">
                  <span className="exp-amount">- {currency}{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <div className="exp-actions">
                    <button className="icon-btn edit-btn" onClick={() => handleEdit(exp)}>✏️</button>
                    <button className="icon-btn delete-btn" onClick={() => handleDelete(exp.id)}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
