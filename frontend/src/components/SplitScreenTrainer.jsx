// frontend/src/components/SplitScreenTrainer.jsx
import React from "react";

/*
SplitScreenTrainer
- Accepts children and renders them in the right column (YOUR video/canvas)
- Left column shows trainer demo, tip overlay, timer badge
- Expects props: exercise { name, color, gradient, ... }, reps, duration, calories
*/

const SplitScreenTrainer = ({ exercise = {}, reps = 0, duration = 0, calories = 0, children }) => {
  const trainerVideoUrl =
    exercise.demoUrl ||
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80&auto=format&fit=crop";

  const leftStyle = {
    position: "relative",
    aspectRatio: "4/3",
    background:
      "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(16,185,129,0.02))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 18,
  };

  const rightStyle = {
    position: "relative",
    aspectRatio: "4/3",
    background:
      "linear-gradient(135deg, rgba(79,172,254,0.04), rgba(0,242,254,0.02))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 18,
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      borderRadius: 20,
      overflow: 'hidden',
      position: 'relative',
      alignItems: 'start'
    }}>
      {/* Trainer Side */}
      <div style={leftStyle}>
        {/* TRAINER label */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: 14,
          padding: '8px 12px',
          background: 'rgba(2,6,23,0.85)',
          borderRadius: 10,
          border: `1px solid ${exercise.color || '#22c55e'}33`,
          fontSize: 12,
          fontWeight: 800,
          color: exercise.color || '#22c55e',
          zIndex: 10,
        }}>
          TRAINER
        </div>

        {/* Timer badge */}
        <div style={{
          position: 'absolute',
          top: 14,
          right: 14,
          width: 64,
          height: 64,
          borderRadius: 999,
          background: 'rgba(2,6,23,0.9)',
          border: `3px solid ${exercise.color || '#22c55e'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: exercise.color || '#22c55e' }}>
            {Math.floor(duration / 60)}
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>Min</div>
        </div>

        {/* trainer media */}
        <img
          src={trainerVideoUrl}
          alt="Trainer demo"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.95)' }}
        />

        {/* form tip overlay */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          padding: 12,
          background: 'linear-gradient(90deg, rgba(34,197,94,0.95), rgba(16,185,129,0.9))',
          backdropFilter: 'blur(8px)',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 700,
          color: '#041024',
          textAlign: 'center',
          zIndex: 20
        }}>
          Keep your chest up, back neutral and knees tracking over your toes.
        </div>
      </div>

      {/* Your Video Side - children go here */}
      <div style={rightStyle}>
        {/* YOU label */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: 14,
          padding: '8px 12px',
          background: 'rgba(2,6,23,0.85)',
          borderRadius: 10,
          border: `1px solid ${exercise.color || '#4facfe'}33`,
          fontSize: 12,
          fontWeight: 800,
          color: exercise.color || '#4facfe',
          zIndex: 10,
        }}>
          YOU
        </div>

        {/* stats badge */}
        <div style={{
          position: 'absolute',
          top: 14,
          right: 14,
          padding: '8px 12px',
          background: 'rgba(2,6,23,0.9)',
          borderRadius: 12,
          border: `2px solid ${exercise.color || '#4facfe'}`,
          zIndex: 10,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: exercise.color || '#4facfe' }}>
            {reps}/{exercise.targetReps ?? 30}
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>{exercise.name || 'Exercise'}</div>
        </div>

        {/* children: your video/canvas or PoseWorkout component */}
        <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
          {children ? children : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Your video feed
            </div>
          )}
        </div>

        {/* calories badge */}
        <div style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          padding: '8px 14px',
          background: 'rgba(2,6,23,0.9)',
          borderRadius: 12,
          border: '1px solid rgba(250,112,154,0.22)',
          zIndex: 10
        }}>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>Calories</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fa709a' }}>{calories}</div>
        </div>
      </div>

      {/* Next Up pill centered bottom */}
      <div style={{
        position: 'absolute',
        bottom: 18,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 18px',
        background: 'rgba(2,6,23,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 14,
        border: `1px solid ${exercise.color || '#22c55e'}33`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 30
      }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: 'linear-gradient(135deg,#22c55e,#10b981)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16
        }}>⏭️</div>
        <div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Next Up</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#e6f0fb' }}>Jump Squats — add explosive power</div>
        </div>
      </div>
    </div>
  );
};

export default SplitScreenTrainer;
