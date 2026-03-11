// frontend/src/components/LoadingScreen.jsx
import React, { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="loading-screen">
      {/* Animated Background Orbs */}
      <div className="loading-orb orb-1"></div>
      <div className="loading-orb orb-2"></div>
      <div className="loading-orb orb-3"></div>

      {/* Main Content */}
      <div className="loading-content">
        {/* Logo Animation */}
        <div className="loading-logo">
          <div className="logo-pulse">💪</div>
        </div>

        <div className="loading-text">
          <h1 className="loading-title">FitAI Trainer</h1>
          <p className="loading-subtitle">Your Personal AI Fitness Coach</p>
        </div>

        {/* Progress Bar */}
        <div className="loading-progress">
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            >
              <div className="progress-glow"></div>
            </div>
          </div>
          <div className="progress-text">{progress}%</div>
        </div>

        {/* Loading Steps */}
        <div className="loading-steps">
          <div className={`step ${progress > 20 ? 'completed' : ''}`}>
            <div className="step-icon">✓</div>
            <div className="step-label">Loading AI Models</div>
          </div>
          <div className={`step ${progress > 50 ? 'completed' : ''}`}>
            <div className="step-icon">✓</div>
            <div className="step-label">Preparing Workspace</div>
          </div>
          <div className={`step ${progress > 80 ? 'completed' : ''}`}>
            <div className="step-icon">✓</div>
            <div className="step-label">Ready to Go!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;