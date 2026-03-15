import React, { useState, useEffect } from 'react';
import './Settings.css';

const SETTINGS_KEY = 'astra_settings';

export const defaultSettings = {
  currency: '€',
  monthlyLimit: 1000,
  language: 'en'
};

export function getSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return { ...defaultSettings, ...saved };
  } catch {
    return defaultSettings;
  }
}

export default function Settings() {
  const [settings, setSettings] = useState(getSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const saveConfig = (e) => {
    e.preventDefault();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // Force a reload so other components pick up the new currency/limit easily:
    window.location.reload();
  };

  return (
    <div className="settings-module fade-in">
      <div className="glass-card">
        <h3 className="section-title">⚙️ Preferences</h3>
        
        <form className="settings-form" onSubmit={saveConfig}>
          <div className="form-group">
            <label>Currency Symbol</label>
            <select 
              value={settings.currency} 
              onChange={e => setSettings({...settings, currency: e.target.value})}
            >
              <option value="€">€ Euro</option>
              <option value="$">$ USD</option>
              <option value="£">£ GBP</option>
              <option value="₺">₺ TRY</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Monthly Budget Limit</label>
            <input 
              type="number" 
              min="1" 
              value={settings.monthlyLimit} 
              onChange={e => setSettings({...settings, monthlyLimit: Number(e.target.value)})}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">💾 Save & Apply</button>
            {saved && <span className="saved-badge fade-in">✅ Saved!</span>}
          </div>
        </form>
      </div>

      <div className="glass-card">
        <h3 className="section-title">🔒 Data Management</h3>
        <p className="settings-hint">Your data is stored locally in your browser. You can export it as a backup.</p>
        <div className="form-actions" style={{ marginTop: '1rem' }}>
          <button className="btn-ghost" onClick={() => {
            const data = {
              bodyData: JSON.parse(localStorage.getItem('astra_body_data') || '[]'),
              budgetData: JSON.parse(localStorage.getItem('astra_budget') || '[]'),
              settings: getSettings()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `astra-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
          }}>📦 Export Data (.json)</button>
        </div>
      </div>
    </div>
  );
}
