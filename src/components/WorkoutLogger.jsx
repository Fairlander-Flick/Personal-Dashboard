import React, { useState, useEffect } from 'react';
import './WorkoutLogger.css';

const PROGRAMS_KEY = 'astra_programs';
const SESSIONS_KEY = 'astra_sessions';

const EXERCISE_LIBRARY = {
  'Chest': ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Fly', 'Cable Crossover', 'Push-Up'],
  'Back': ['Deadlift', 'Pull-Up', 'Bent-Over Row', 'Lat Pulldown', 'Seated Cable Row', 'T-Bar Row'],
  'Legs': ['Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Extension', 'Leg Curl', 'Calf Raise'],
  'Shoulders': ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Arnold Press', 'Rear Delt Fly'],
  'Arms': ['Bicep Curl', 'Hammer Curl', 'Tricep Pushdown', 'Skull Crusher', 'Preacher Curl', 'Dips'],
  'Core': ['Crunch', 'Plank', 'Leg Raise', 'Russian Twist', 'Ab Wheel'],
};

const GROUP_COLORS = {
  'Chest': '#3b82f6',
  'Back': '#8b5cf6',
  'Legs': '#10b981',
  'Shoulders': '#f59e0b',
  'Arms': '#ec4899',
  'Core': '#94a3b8',
};

function load(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

// ─── Get last logged sets for an exercise in a given program ───
function getLastSets(sessions, programId, exerciseName) {
  const programSessions = sessions
    .filter(s => s.programId === programId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const session of programSessions) {
    const ex = session.exercises.find(e => e.name === exerciseName);
    if (ex && ex.sets.length > 0) return ex.sets;
  }
  return [];
}

// ─── Set Row ───
function SetRow({ set, index, onChange, onDelete }) {
  return (
    <div className="set-row">
      <span className="set-num">Set {index + 1}</span>
      <input
        type="number" min="0" step="0.5"
        value={set.weight}
        onChange={e => onChange(index, { ...set, weight: parseFloat(e.target.value) || 0 })}
        className="set-input"
        placeholder="lbs/kg"
      />
      <span className="set-unit">kg</span>
      <input
        type="number" min="0"
        value={set.reps}
        onChange={e => onChange(index, { ...set, reps: parseInt(e.target.value) || 0 })}
        className="set-input"
        placeholder="reps"
      />
      <span className="set-unit">reps</span>
      <button className="icon-btn delete-btn" onClick={() => onDelete(index)}>✕</button>
    </div>
  );
}

// ─── Program Manager ───
function ProgramManager({ programs, setPrograms }) {
  const [newName, setNewName] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');

  const createProgram = () => {
    if (!newName.trim()) return;
    const p = { id: Date.now(), name: newName.trim(), exercises: [] };
    setPrograms(prev => [...prev, p]);
    setNewName('');
    setSelectedProgram(p.id);
  };

  const deleteProgram = (id) => {
    setPrograms(prev => prev.filter(p => p.id !== id));
    if (selectedProgram === id) setSelectedProgram(null);
  };

  const addExercise = (programId) => {
    if (!selectedExercise) return;
    setPrograms(prev => prev.map(p => {
      if (p.id !== programId) return p;
      if (p.exercises.find(e => e.name === selectedExercise)) return p;
      const group = Object.keys(EXERCISE_LIBRARY).find(g => EXERCISE_LIBRARY[g].includes(selectedExercise));
      return { ...p, exercises: [...p.exercises, { name: selectedExercise, group }] };
    }));
    setSelectedExercise('');
    setSearchTerm('');
  };

  const removeExercise = (programId, exName) => {
    setPrograms(prev => prev.map(p =>
      p.id !== programId ? p : { ...p, exercises: p.exercises.filter(e => e.name !== exName) }
    ));
  };

  const activeProgram = programs.find(p => p.id === selectedProgram);

  return (
    <div className="program-manager">
      {/* Create Program */}
      <div className="glass-card">
        <h3 className="section-title">🗂 Workout Programs</h3>
        <div className="inline-form">
          <input
            type="text"
            placeholder="Program name (e.g. Push Day, Leg Day)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createProgram()}
          />
          <button className="btn-primary" onClick={createProgram}>+ Create</button>
        </div>

        {programs.length === 0 && (
          <p className="empty-hint">No programs yet. Create one to get started.</p>
        )}

        <div className="program-list">
          {programs.map(p => (
            <div
              key={p.id}
              className={`program-chip ${selectedProgram === p.id ? 'active' : ''}`}
              onClick={() => setSelectedProgram(p.id)}
            >
              <span>{p.name}</span>
              <span className="program-chip-count">{p.exercises.length} exercises</span>
              <button className="chip-delete" onClick={e => { e.stopPropagation(); deleteProgram(p.id); }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Program */}
      {activeProgram && (
        <div className="glass-card fade-in">
          <h3 className="section-title">Editing: {activeProgram.name}</h3>

          {/* Exercise picker */}
          <div className="selector-row">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="exercise-search"
            />
            <select
              value={selectedExercise}
              onChange={e => setSelectedExercise(e.target.value)}
              className="exercise-select"
            >
              <option value="">-- Select Exercise --</option>
              {Object.entries(EXERCISE_LIBRARY).map(([group, moves]) => (
                <optgroup key={group} label={group}>
                  {moves.filter(m => m.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(m => <option key={m} value={m}>{m}</option>)}
                </optgroup>
              ))}
            </select>
            <button className="btn-primary" onClick={() => addExercise(activeProgram.id)}>Add</button>
          </div>

          {/* Exercises in program */}
          {activeProgram.exercises.length === 0 && (
            <p className="empty-hint">No exercises added yet.</p>
          )}
          <div className="program-exercises">
            {activeProgram.exercises.map(ex => (
              <div key={ex.name} className="program-exercise-item">
                <span className="exercise-badge" style={{ '--badge-color': GROUP_COLORS[ex.group] }}>{ex.group}</span>
                <span className="pex-name">{ex.name}</span>
                <button className="icon-btn delete-btn" onClick={() => removeExercise(activeProgram.id, ex.name)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Log Session ───
function LogSession({ programs, sessions, setSessions }) {
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState([]);
  const [saved, setSaved] = useState(false);

  const handleSelectProgram = (programId) => {
    setSelectedProgramId(programId);
    setSaved(false);
    const program = programs.find(p => p.id === parseInt(programId));
    if (!program) { setExercises([]); return; }
    const prefilled = program.exercises.map(ex => {
      const lastSets = getLastSets(sessions, program.id, ex.name);
      return {
        ...ex,
        sets: lastSets.length > 0
          ? lastSets.map(s => ({ ...s }))
          : [{ weight: 0, reps: 0 }],
      };
    });
    setExercises(prefilled);
  };

  const updateSet = (exIndex, setIndex, updated) => {
    setExercises(prev => prev.map((ex, i) =>
      i !== exIndex ? ex : { ...ex, sets: ex.sets.map((s, j) => j === setIndex ? updated : s) }
    ));
  };

  const deleteSet = (exIndex, setIndex) => {
    setExercises(prev => prev.map((ex, i) =>
      i !== exIndex ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== setIndex) }
    ));
  };

  const addSet = (exIndex) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIndex) return ex;
      const last = ex.sets[ex.sets.length - 1] || { weight: 0, reps: 0 };
      return { ...ex, sets: [...ex.sets, { ...last }] };
    }));
  };

  const saveSession = () => {
    const program = programs.find(p => p.id === parseInt(selectedProgramId));
    if (!program || exercises.length === 0) return;
    const session = {
      id: Date.now(),
      date,
      programId: program.id,
      programName: program.name,
      exercises,
    };
    setSessions(prev => [session, ...prev]);
    setSaved(true);
  };

  if (programs.length === 0) {
    return (
      <div className="glass-card">
        <p className="empty-hint">Create a workout program first in the <strong>Programs</strong> tab.</p>
      </div>
    );
  }

  return (
    <div className="log-session">
      <div className="glass-card">
        <h3 className="section-title">📅 Log Today's Session</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Program</label>
            <select value={selectedProgramId} onChange={e => handleSelectProgram(e.target.value)}>
              <option value="">-- Select Program --</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {exercises.map((ex, i) => (
        <div key={ex.name} className="glass-card exercise-log-block fade-in">
          <div className="exercise-log-header">
            <div>
              <span className="exercise-badge" style={{ '--badge-color': GROUP_COLORS[ex.group] }}>{ex.group}</span>
              <h4 className="exercise-name">{ex.name}</h4>
            </div>
            <span className="last-session-hint">↑ Pre-filled from last session</span>
          </div>

          <div className="sets-list">
            {ex.sets.map((set, si) => (
              <SetRow
                key={si}
                set={set}
                index={si}
                onChange={(idx, updated) => updateSet(i, idx, updated)}
                onDelete={(idx) => deleteSet(i, idx)}
              />
            ))}
          </div>

          <button className="add-set-link" onClick={() => addSet(i)}>+ Add Set</button>
        </div>
      ))}

      {exercises.length > 0 && (
        <div className="form-actions">
          {saved ? (
            <span className="saved-badge">✅ Session saved!</span>
          ) : (
            <button className="btn-primary" onClick={saveSession}>
              Save Session ({exercises.length} exercises)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Session History ───
function SessionHistory({ sessions, setSessions }) {
  const [expanded, setExpanded] = useState(null);

  if (sessions.length === 0) return (
    <div className="glass-card"><p className="empty-hint">No sessions logged yet.</p></div>
  );

  return (
    <div className="glass-card">
      <h3 className="section-title">📋 Session History</h3>
      <div className="workout-history">
        {sessions.map(session => {
          const isOpen = expanded === session.id;
          const totalSets = session.exercises.reduce((a, ex) => a + ex.sets.length, 0);
          const totalVol = session.exercises.reduce((a, ex) => a + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);
          return (
            <div key={session.id} className={`workout-card ${isOpen ? 'expanded' : ''}`}>
              <div className="workout-card-header" onClick={() => setExpanded(isOpen ? null : session.id)}>
                <div className="workout-card-info">
                  <span className="workout-card-date">
                    {new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <h4 className="workout-card-name">{session.programName}</h4>
                  <div className="workout-card-tags">
                    <span className="tag">{session.exercises.length} exercises</span>
                    <span className="tag">{totalSets} sets</span>
                    <span className="tag accent">{totalVol.toLocaleString()} kg vol</span>
                  </div>
                </div>
                <div className="workout-card-right">
                  <button className="icon-btn delete-btn" onClick={e => { e.stopPropagation(); setSessions(prev => prev.filter(s => s.id !== session.id)); }}>🗑</button>
                  <span className="expand-icon">{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>
              {isOpen && (
                <div className="workout-detail fade-in">
                  {session.exercises.map(ex => (
                    <div key={ex.name} className="detail-exercise">
                      <div className="detail-exercise-header">
                        <span className="exercise-badge small" style={{ '--badge-color': GROUP_COLORS[ex.group] }}>{ex.group}</span>
                        <span className="detail-exercise-name">{ex.name}</span>
                      </div>
                      <div className="detail-sets">
                        {ex.sets.map((set, si) => (
                          <div key={si} className="detail-set-row">
                            <span>Set {si + 1}</span>
                            <span>{set.weight} kg × {set.reps} reps</span>
                            <span className="detail-vol">{(set.weight * set.reps).toFixed(0)} kg vol</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ───
export default function WorkoutLogger() {
  const [programs, setPrograms] = useState(() => load(PROGRAMS_KEY));
  const [sessions, setSessions] = useState(() => load(SESSIONS_KEY));
  const [activeTab, setActiveTab] = useState('log');

  useEffect(() => { localStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs)); }, [programs]);
  useEffect(() => { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); }, [sessions]);

  return (
    <div className="workout-logger">
      <div className="inner-tabs">
        {[['log', '📅 Log Session'], ['programs', '🗂 Programs'], ['history', '📋 History']].map(([id, label]) => (
          <button key={id} className={`inner-tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'log' && <LogSession programs={programs} sessions={sessions} setSessions={setSessions} />}
      {activeTab === 'programs' && <ProgramManager programs={programs} setPrograms={setPrograms} />}
      {activeTab === 'history' && <SessionHistory sessions={sessions} setSessions={setSessions} />}
    </div>
  );
}
