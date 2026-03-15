import React, { useState, useEffect } from 'react';
import './BodyTracker.css';

const STORAGE_KEY = 'astra_body_data';

function getInitialData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// Simple SVG line chart for weight trend
function WeightChart({ data }) {
  if (data.length < 2) return null;

  // Sort chronological for chart
  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const minWeight = Math.min(...sorted.map(d => d.weight)) - 2;
  const maxWeight = Math.max(...sorted.map(d => d.weight)) + 2;
  
  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 20;
  
  const points = sorted.map((d, i) => {
    const x = paddingX + (i / (sorted.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((d.weight - minWeight) / (maxWeight - minWeight)) * (height - 2 * paddingY);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="weight-chart-container glass-card">
      <h4 className="chart-title">Weight Trend</h4>
      <svg viewBox={`0 0 ${width} ${height}`} className="weight-svg">
        <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <polyline
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="chart-line"
        />
        {sorted.map((d, i) => {
          const x = paddingX + (i / (sorted.length - 1)) * (width - 2 * paddingX);
          const y = height - paddingY - ((d.weight - minWeight) / (maxWeight - minWeight)) * (height - 2 * paddingY);
          return (
            <g key={d.id}>
              <circle cx={x} cy={y} r="4" fill="var(--bg-surface)" stroke="var(--primary)" strokeWidth="2" />
              <text x={x} y={y - 12} fill="var(--text-secondary)" fontSize="10" textAnchor="middle">{d.weight}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function BodyTracker() {
  const [entries, setEntries] = useState(getInitialData);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weight || !date) return;

    if (editingId) {
      setEntries(prev =>
        prev.map(entry =>
          entry.id === editingId
            ? { ...entry, weight: parseFloat(weight), date }
            : entry
        ).sort((a, b) => new Date(b.date) - new Date(a.date)) // keep sorted latest first
      );
      setEditingId(null);
    } else {
      const newEntry = {
        id: Date.now(),
        date,
        weight: parseFloat(weight)
      };
      setEntries(prev => [...prev, newEntry].sort((a, b) => new Date(b.date) - new Date(a.date)));
    }

    setWeight('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setWeight(String(entry.weight));
    setDate(entry.date);
  };

  const handleDelete = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setWeight('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setWeight('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // Entries are already sorted latest first
  const latest = entries[0];

  return (
    <div className="body-tracker">
      {/* Header Stats */}
      {latest && (
        <div className="body-stats fade-in">
          <div className="body-stat-item">
            <span className="body-stat-value">{latest.weight}<small>kg</small></span>
            <span className="body-stat-label">Current Weight</span>
          </div>
          <div className="body-stat-item">
            <span className="body-stat-value secondary">{entries.length}</span>
            <span className="body-stat-label">Log Entries</span>
          </div>
        </div>
      )}

      {/* Chart */}
      {entries.length >= 2 && <WeightChart data={entries} />}

      {/* Entry Form */}
      <form className="glass-card body-form fade-in" onSubmit={handleSubmit}>
        <h3 className="form-title">{editingId ? '✏️ Edit Entry' : '⚖️ Log Weight'}</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 78.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingId ? '💾 Update' : '+ Add'}
          </button>
          {editingId && (
            <button type="button" className="btn-ghost" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* History List */}
      {entries.length > 0 && (
        <div className="glass-card fade-in">
          <h3 className="section-title">📋 History</h3>
          <div className="body-history-list">
            {entries.map((entry, idx) => (
              <div key={entry.id} className={`history-item ${idx === 0 ? 'latest' : ''}`}>
                <div className="history-info">
                  <span className="history-date">
                    {new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <div className="history-values">
                    <span className="history-weight">{entry.weight} kg</span>
                  </div>
                </div>
                <div className="history-actions">
                  <button className="icon-btn edit-btn" onClick={() => handleEdit(entry)} title="Edit">✏️</button>
                  <button className="icon-btn delete-btn" onClick={() => handleDelete(entry.id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
