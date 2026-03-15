import React, { useState, useEffect } from 'react';
import './WorkoutLogger.css';

const STORAGE_KEY = 'astra_workouts';

const EXERCISE_LIBRARY = {
  'Göğüs 🔴': ['Bench Press', 'İncline Bench Press', 'Decline Bench Press', 'Dumbbell Fly', 'Cable Crossover', 'Push-Up'],
  'Sırt 🔵': ['Deadlift', 'Pull-Up', 'Bent-Over Row', 'Lat Pulldown', 'Seated Cable Row', 'T-Bar Row'],
  'Bacak 🟢': ['Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Extension', 'Leg Curl', 'Calf Raise'],
  'Omuz 🟡': ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Arnold Press', 'Rear Delt Fly'],
  'Kol 🟣': ['Bicep Curl', 'Hammer Curl', 'Tricep Pushdown', 'Skull Crusher', 'Preacher Curl', 'Dips'],
  'Karın ⚪': ['Crunch', 'Plank', 'Leg Raise', 'Russian Twist', 'Ab Wheel'],
};

const ALL_EXERCISES = Object.entries(EXERCISE_LIBRARY).flatMap(([group, moves]) =>
  moves.map((name) => ({ name, group }))
);

function getInitialWorkouts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// ─── Set Row Component ───
function SetRow({ set, index, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ weight: set.weight, reps: set.reps });

  const save = () => {
    onEdit(index, { weight: parseFloat(form.weight) || 0, reps: parseInt(form.reps) || 0 });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="set-row editing">
        <span className="set-num">Set {index + 1}</span>
        <input
          type="number" min="0" step="0.5"
          value={form.weight}
          onChange={(e) => setForm(f => ({ ...f, weight: e.target.value }))}
          className="set-input"
          placeholder="kg"
        />
        <span className="set-unit">kg</span>
        <input
          type="number" min="0"
          value={form.reps}
          onChange={(e) => setForm(f => ({ ...f, reps: e.target.value }))}
          className="set-input"
          placeholder="rep"
        />
        <span className="set-unit">rep</span>
        <button className="set-save-btn" onClick={save}>✓</button>
        <button className="set-cancel-btn" onClick={() => setIsEditing(false)}>✕</button>
      </div>
    );
  }

  return (
    <div className="set-row">
      <span className="set-num">Set {index + 1}</span>
      <span className="set-val">{set.weight} <small>kg</small></span>
      <span className="set-sep">×</span>
      <span className="set-val">{set.reps} <small>rep</small></span>
      <div className="set-actions">
        <button className="icon-btn edit-btn" onClick={() => setIsEditing(true)}>✏️</button>
        <button className="icon-btn delete-btn" onClick={() => onDelete(index)}>🗑️</button>
      </div>
    </div>
  );
}

// ─── Exercise Block Component ───
function ExerciseBlock({ exercise, onAddSet, onEditSet, onDeleteSet, onDeleteExercise }) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const addSet = () => {
    if (!weight || !reps) return;
    onAddSet({ weight: parseFloat(weight), reps: parseInt(reps) });
    // Keep values for easy multi-set entry
  };

  return (
    <div className="exercise-block">
      <div className="exercise-header">
        <div>
          <span className="exercise-badge">{exercise.group}</span>
          <h4 className="exercise-name">{exercise.name}</h4>
        </div>
        <button className="icon-btn delete-btn" onClick={onDeleteExercise} title="Egzersizi sil">🗑️</button>
      </div>

      {/* Existing Sets */}
      {exercise.sets.length > 0 && (
        <div className="sets-list">
          {exercise.sets.map((set, i) => (
            <SetRow
              key={i}
              set={set}
              index={i}
              onEdit={(idx, updated) => onEditSet(idx, updated)}
              onDelete={(idx) => onDeleteSet(idx)}
            />
          ))}
        </div>
      )}

      {/* Add Set Row */}
      <div className="add-set-row">
        <span className="set-num">Set {exercise.sets.length + 1}</span>
        <input
          type="number" min="0" step="0.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="kg"
          className="set-input"
        />
        <span className="set-unit">kg</span>
        <input
          type="number" min="0"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="rep"
          className="set-input"
        />
        <span className="set-unit">rep</span>
        <button className="set-add-btn" onClick={addSet}>+ Ekle</button>
      </div>
    </div>
  );
}

// ─── Main Workout Logger ───
export default function WorkoutLogger() {
  const [workouts, setWorkouts] = useState(getInitialWorkouts);
  const [isCreating, setIsCreating] = useState(false);
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWorkout, setExpandedWorkout] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  }, [workouts]);

  const filteredExercises = ALL_EXERCISES.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addExercise = () => {
    const found = ALL_EXERCISES.find((e) => e.name === selectedExercise);
    if (!found) return;
    if (exercises.find((e) => e.name === selectedExercise)) return;
    setExercises((prev) => [...prev, { ...found, sets: [] }]);
    setSelectedExercise('');
    setSearchTerm('');
  };

  const addSet = (exIndex, set) => {
    setExercises((prev) =>
      prev.map((ex, i) => i === exIndex ? { ...ex, sets: [...ex.sets, set] } : ex)
    );
  };

  const editSet = (exIndex, setIndex, updated) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIndex ? ex : { ...ex, sets: ex.sets.map((s, j) => j === setIndex ? updated : s) }
      )
    );
  };

  const deleteSet = (exIndex, setIndex) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIndex ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== setIndex) }
      )
    );
  };

  const deleteExercise = (exIndex) => {
    setExercises((prev) => prev.filter((_, i) => i !== exIndex));
  };

  const saveWorkout = () => {
    if (!workoutDate || exercises.length === 0) return;
    const workout = {
      id: Date.now(),
      date: workoutDate,
      name: workoutName || 'Antrenman',
      exercises,
    };
    setWorkouts((prev) => [workout, ...prev]);
    setIsCreating(false);
    setExercises([]);
    setWorkoutName('');
    setWorkoutDate(new Date().toISOString().split('T')[0]);
  };

  const deleteWorkout = (id) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="workout-logger">
      {/* START NEW WORKOUT */}
      {!isCreating ? (
        <button className="btn-primary start-workout-btn" onClick={() => setIsCreating(true)}>
          + Yeni Antrenman Başlat
        </button>
      ) : (
        <div className="glass-card workout-creator fade-in">
          <h3 className="form-title">🏋️ Yeni Antrenman</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Tarih</label>
              <input type="date" value={workoutDate} onChange={(e) => setWorkoutDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Antrenman Adı (opsiyonel)</label>
              <input
                type="text"
                placeholder="örn. Göğüs Günü"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
            </div>
          </div>

          {/* Exercise Selector */}
          <div className="exercise-selector">
            <label className="selector-label">Hareket Ekle</label>
            <div className="selector-row">
              <input
                type="text"
                placeholder="Hareket ara... (örn. Squat)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  const match = filteredExercises[0];
                  if (match) setSelectedExercise(match.name);
                }}
                className="exercise-search"
              />
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="exercise-select"
              >
                <option value="">-- Seç --</option>
                {Object.entries(EXERCISE_LIBRARY).map(([group, moves]) => (
                  <optgroup key={group} label={group}>
                    {moves
                      .filter((m) => m.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                  </optgroup>
                ))}
              </select>
              <button className="btn-primary" onClick={addExercise}>Ekle</button>
            </div>
          </div>

          {/* Exercise Blocks */}
          {exercises.map((ex, i) => (
            <ExerciseBlock
              key={ex.name}
              exercise={ex}
              onAddSet={(set) => addSet(i, set)}
              onEditSet={(setIdx, updated) => editSet(i, setIdx, updated)}
              onDeleteSet={(setIdx) => deleteSet(i, setIdx)}
              onDeleteExercise={() => deleteExercise(i)}
            />
          ))}

          <div className="form-actions">
            <button
              className="btn-primary"
              onClick={saveWorkout}
              disabled={exercises.length === 0}
            >
              💾 Antrenmanı Kaydet ({exercises.length} hareket)
            </button>
            <button className="btn-ghost" onClick={() => { setIsCreating(false); setExercises([]); }}>
              İptal
            </button>
          </div>
        </div>
      )}

      {/* WORKOUT HISTORY */}
      {workouts.length > 0 && (
        <div className="glass-card fade-in">
          <h3 className="section-title">📋 Antrenman Geçmişi</h3>
          <div className="workout-history">
            {workouts.map((workout) => {
              const isExpanded = expandedWorkout === workout.id;
              const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
              const totalVolume = workout.exercises.reduce(
                (acc, ex) => acc + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
                0
              );

              return (
                <div key={workout.id} className={`workout-card ${isExpanded ? 'expanded' : ''}`}>
                  <div className="workout-card-header" onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}>
                    <div className="workout-card-info">
                      <span className="workout-card-date">
                        {new Date(workout.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <h4 className="workout-card-name">{workout.name}</h4>
                      <div className="workout-card-tags">
                        <span className="tag">{workout.exercises.length} hareket</span>
                        <span className="tag">{totalSets} set</span>
                        <span className="tag accent">{totalVolume.toLocaleString('tr-TR')} kg hacim</span>
                      </div>
                    </div>
                    <div className="workout-card-right">
                      <button className="icon-btn delete-btn" onClick={(e) => { e.stopPropagation(); deleteWorkout(workout.id); }}>🗑️</button>
                      <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="workout-detail fade-in">
                      {workout.exercises.map((ex) => (
                        <div key={ex.name} className="detail-exercise">
                          <div className="detail-exercise-header">
                            <span className="exercise-badge small">{ex.group}</span>
                            <span className="detail-exercise-name">{ex.name}</span>
                          </div>
                          <div className="detail-sets">
                            {ex.sets.map((set, si) => (
                              <div key={si} className="detail-set-row">
                                <span>Set {si + 1}</span>
                                <span>{set.weight} kg × {set.reps} rep</span>
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
      )}
    </div>
  );
}
