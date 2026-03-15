import React, { useState } from 'react';
import BodyTracker from './BodyTracker';
import WorkoutLogger from './WorkoutLogger';
import './Fitness.css';

export default function Fitness() {
  const [activeSection, setActiveSection] = useState('workout');

  return (
    <div className="fitness-page fade-in">
      <div className="fitness-section-tabs">
        <button
          className={`section-tab ${activeSection === 'workout' ? 'active' : ''}`}
          onClick={() => setActiveSection('workout')}
        >
          🏋️ Workout Log
        </button>
        <button
          className={`section-tab ${activeSection === 'body' ? 'active' : ''}`}
          onClick={() => setActiveSection('body')}
        >
          ⚖️ Weight Tracker
        </button>
      </div>

      {activeSection === 'workout' && <WorkoutLogger />}
      {activeSection === 'body' && <BodyTracker />}
    </div>
  );
}
