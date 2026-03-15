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

export default function BodyTracker() {
  const [entries, setEntries] = useState(getInitialData);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weight || !date) return;

    if (editingId) {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingId
            ? { ...entry, weight: parseFloat(weight), bodyFat: bodyFat ? parseFloat(bodyFat) : null, date }
            : entry
        )
      );
      setEditingId(null);
    } else {
      const newEntry = {
        id: Date.now(),
        date,
        weight: parseFloat(weight),
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      };
      setEntries((prev) => [newEntry, ...prev]);
    }

    setWeight('');
    setBodyFat('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setWeight(String(entry.weight));
    setBodyFat(entry.bodyFat != null ? String(entry.bodyFat) : '');
    setDate(entry.date);
  };

  const handleDelete = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setWeight('');
      setBodyFat('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setWeight('');
    setBodyFat('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const latest = entries[0];

  return (
    <div className="body-tracker">
      {/* Header Stats */}
      {latest && (
        <div className="body-stats fade-in">
          <div className="body-stat-item">
            <span className="body-stat-value">{latest.weight}<small>kg</small></span>
            <span className="body-stat-label">Son Kilo</span>
          </div>
          {latest.bodyFat != null && (
            <div className="body-stat-item">
              <span className="body-stat-value">{latest.bodyFat}<small>%</small></span>
              <span className="body-stat-label">Vücut Yağı</span>
            </div>
          )}
          <div className="body-stat-item">
            <span className="body-stat-value secondary">{entries.length}</span>
            <span className="body-stat-label">Kayıt</span>
          </div>
        </div>
      )}

      {/* Entry Form */}
      <form className="glass-card body-form fade-in" onSubmit={handleSubmit}>
        <h3 className="form-title">{editingId ? '✏️ Kaydı Düzenle' : '⚖️ Vücut Verisi Ekle'}</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Tarih</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Kilo (kg) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="örn. 78.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Vücut Yağı (%) <span className="optional">opsiyonel</span></label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="örn. 18.2"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingId ? '💾 Güncelle' : '+ Ekle'}
          </button>
          {editingId && (
            <button type="button" className="btn-ghost" onClick={handleCancel}>
              İptal
            </button>
          )}
        </div>
      </form>

      {/* History List */}
      {entries.length > 0 && (
        <div className="glass-card fade-in">
          <h3 className="section-title">📋 Geçmiş Kayıtlar</h3>
          <div className="body-history-list">
            {entries.map((entry, idx) => (
              <div key={entry.id} className={`history-item ${idx === 0 ? 'latest' : ''}`}>
                <div className="history-info">
                  <span className="history-date">{new Date(entry.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <div className="history-values">
                    <span className="history-weight">{entry.weight} kg</span>
                    {entry.bodyFat != null && <span className="history-fat">%{entry.bodyFat} yağ</span>}
                  </div>
                </div>
                <div className="history-actions">
                  <button className="icon-btn edit-btn" onClick={() => handleEdit(entry)} title="Düzenle">✏️</button>
                  <button className="icon-btn delete-btn" onClick={() => handleDelete(entry.id)} title="Sil">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
