// frontend/src/components/ExerciseSelector.jsx
import React from "react";

const ExerciseSelector = ({ exercises, onSelect }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#22c55e';
      case 'Intermediate': return '#f59e0b';
      case 'Advanced': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="exercise-grid">
      {exercises.map((exercise, index) => (
        <div 
          key={exercise.id}
          className="exercise-card"
          onClick={() => onSelect(exercise)}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="exercise-card-bg" style={{ background: exercise.color }}></div>
          
          <div className="exercise-card-header">
            <div className="exercise-icon-large">{exercise.icon}</div>
            <div 
              className="difficulty-badge"
              style={{ borderColor: getDifficultyColor(exercise.difficulty) }}
            >
              <div 
                className="difficulty-dot"
                style={{ background: getDifficultyColor(exercise.difficulty) }}
              ></div>
              {exercise.difficulty}
            </div>
          </div>

          <div className="exercise-card-content">
            <h3 className="exercise-card-title">{exercise.name}</h3>
            <p className="exercise-card-target">
              <span className="target-icon">🎯</span>
              {exercise.target}
            </p>
            <p className="exercise-card-desc">{exercise.description}</p>

            <div className="exercise-tips">
              <div className="tips-label">Key Points:</div>
              <ul className="tips-list">
                {exercise.tips.slice(0, 2).map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>

          <button className="select-exercise-btn">
            <span>Start Exercise</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ExerciseSelector;