// frontend/src/pages/Workout.jsx
import React, { useState, useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";

// Exercise data
const exercises = [
  {
    id: 'squats',
    name: 'Squats',
    icon: '🦵',
    level: 'Beginner',
    color: '#ff6b9d',
    gradient: 'linear-gradient(135deg, #ff6b9d, #c471ed)',
    targetMuscles: 'Legs, Glutes',
    description: 'Lower body strength exercise targeting quads, hamstrings, and glutes.',
    keyPoints: [
      'Keep your chest up and back straight',
      'Push through your heels',
      'Knees should track over toes',
      'Go down until thighs are parallel to ground'
    ]
  },
  {
    id: 'pushups',
    name: 'Push-ups',
    icon: '💪',
    level: 'Beginner',
    color: '#4facfe',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    targetMuscles: 'Chest, Arms, Core',
    description: 'Upper body compound exercise for chest, shoulders, and triceps.',
    keyPoints: [
      'Keep body in straight line',
      'Hands slightly wider than shoulders',
      'Lower until chest nearly touches ground',
      'Push back up explosively'
    ]
  },
  {
    id: 'bicep-curls',
    name: 'Bicep Curls',
    icon: '💪',
    level: 'Beginner',
    color: '#fa709a',
    gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
    targetMuscles: 'Biceps',
    description: 'Isolation exercise for building bicep strength and size.',
    keyPoints: [
      'Keep elbows stationary at sides',
      'Control the movement both ways',
      'Full range of motion',
      'Don\'t swing or use momentum'
    ]
  }
];

// Exercise Selection Screen
const ExerciseSelection = ({ onSelectExercise }) => {
  const [selectedEx, setSelectedEx] = useState(null);

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: 40,
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 48,
          fontWeight: 900,
          margin: 0,
          marginBottom: 12,
          background: 'linear-gradient(135deg, #ff6b9d, #4facfe)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>
          Choose Your Exercise
        </h1>
        <p style={{
          fontSize: 18,
          color: '#94a3b8',
          margin: 0
        }}>
          Select an exercise to start AI-powered form analysis and rep counting
        </p>
        <div style={{
          marginTop: 16,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.2)',
            animation: 'pulse 2s infinite'
          }}/>
          AI Trainer Ready
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 24,
        marginBottom: 80
      }}>
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => setSelectedEx(exercise)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: 24,
              padding: 28,
              border: selectedEx?.id === exercise.id 
                ? `2px solid ${exercise.color}`
                : '1px solid rgba(148, 163, 184, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: selectedEx?.id === exercise.id
                ? `0 20px 60px ${exercise.color}40`
                : '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 20px 60px ${exercise.color}40`;
            }}
            onMouseLeave={(e) => {
              if (selectedEx?.id !== exercise.id) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
              }
            }}
          >
            {/* Gradient Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60%',
              height: '100%',
              background: exercise.gradient,
              opacity: 0.1,
              borderRadius: '50%',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }}/>

            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              position: 'relative'
            }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: exercise.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                boxShadow: `0 8px 24px ${exercise.color}60`
              }}>
                {exercise.icon}
              </div>
              <div style={{
                padding: '6px 14px',
                background: `${exercise.color}20`,
                border: `1px solid ${exercise.color}40`,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                color: exercise.color
              }}>
                {exercise.level}
              </div>
            </div>

            {/* Exercise Name */}
            <h3 style={{
              fontSize: 28,
              fontWeight: 800,
              margin: '0 0 8px 0',
              color: '#f1f5f9',
              position: 'relative'
            }}>
              {exercise.name}
            </h3>

            {/* Target Muscles */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 16
            }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: exercise.color
              }}/>
              <span style={{
                fontSize: 13,
                color: '#94a3b8',
                fontWeight: 600
              }}>
                {exercise.targetMuscles}
              </span>
            </div>

            {/* Description */}
            <p style={{
              fontSize: 14,
              color: '#cbd5e1',
              lineHeight: 1.7,
              marginBottom: 20
            }}>
              {exercise.description}
            </p>

            {/* Key Points */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 16,
              padding: 16,
              border: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#94a3b8',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Key Points:
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: 20,
                fontSize: 13,
                color: '#cbd5e1',
                lineHeight: 2
              }}>
                {exercise.keyPoints.slice(0, 2).map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Start Button */}
      {selectedEx && (
        <div style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          animation: 'slideUp 0.3s ease'
        }}>
          <button
            onClick={() => onSelectExercise(selectedEx)}
            style={{
              padding: '20px 48px',
              fontSize: 18,
              fontWeight: 800,
              color: 'white',
              background: selectedEx.gradient,
              border: 'none',
              borderRadius: 16,
              cursor: 'pointer',
              boxShadow: `0 12px 40px ${selectedEx.color}60`,
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = `0 16px 48px ${selectedEx.color}80`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 12px 40px ${selectedEx.color}60`;
            }}
          >
            Start Exercise →
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Workout Session Screen
const WorkoutSession = ({ exercise, onBack }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);

  const [status, setStatus] = useState("Loading AI model...");
  const [reps, setReps] = useState(0);
  const [formFeedback, setFormFeedback] = useState("Position yourself in frame");
  const [kneeAngle, setKneeAngle] = useState("--");
  const [formQuality, setFormQuality] = useState(0);
  const [calories, setCalories] = useState(0);
  const [duration, setDuration] = useState(0);

  const repState = useRef("up");
  const lastRepTime = useRef(0);
  const angleWindow = useRef([]);
  const startTime = useRef(Date.now());
  const WINDOW_SIZE = 6;

  useEffect(() => {
    let mounted = true;
    const timer = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime.current) / 1000));
      setCalories(Math.floor(reps * 5 + duration * 0.1));
    }, 1000);

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { width: 640, height: 480 },
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        try {
          await tf.setBackend("webgl");
          await tf.ready();
        } catch (err) {
          await tf.ready();
        }

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );

        detectorRef.current = detector;
        setStatus("AI Ready - Start exercising!");
        rafRef.current = requestAnimationFrame(detectPose);
      } catch (err) {
        console.error("Setup error:", err);
        setStatus("Camera error: " + (err.message || err));
      }
    };

    init();

    return () => {
      mounted = false;
      clearInterval(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      if (detectorRef.current?.dispose) {
        try { detectorRef.current.dispose(); } catch (e) {}
      }
    };
  }, []);

  const getKp = (keypoints, name, idxFallback) => {
    if (!keypoints || keypoints.length === 0) return null;
    if (keypoints[0]?.name) {
      return keypoints.find((k) => k.name === name) || keypoints[idxFallback] || null;
    }
    return keypoints[idxFallback] || null;
  };

  const calcAngle = (A, B, C) => {
    if (!A || !B || !C) return null;
    const AB = { x: A.x - B.x, y: A.y - B.y };
    const CB = { x: C.x - B.x, y: C.y - B.y };
    const dot = AB.x * CB.x + AB.y * CB.y;
    const magAB = Math.hypot(AB.x, AB.y);
    const magCB = Math.hypot(CB.x, CB.y);
    if (magAB === 0 || magCB === 0) return null;
    let cos = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
    return (Math.acos(cos) * 180) / Math.PI;
  };

  const drawKeypoints = (ctx, keypoints) => {
    if (!keypoints) return;
    keypoints.forEach((kp) => {
      if (!kp || (kp.score != null && kp.score < 0.3)) return;
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = exercise.color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const detectPose = async () => {
    if (!detectorRef.current || !videoRef.current) {
      rafRef.current = requestAnimationFrame(detectPose);
      return;
    }

    try {
      const poses = await detectorRef.current.estimatePoses(videoRef.current, {
        maxPoses: 1,
        flipHorizontal: true,
      });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      if (!poses || poses.length === 0) {
        setFormFeedback("Move into frame to begin");
        setFormQuality(0);
        setKneeAngle("--");
      } else {
        const keypoints = poses[0].keypoints;
        drawKeypoints(ctx, keypoints);

        const leftHip = getKp(keypoints, "left_hip", 11);
        const leftKnee = getKp(keypoints, "left_knee", 13);
        const leftAnkle = getKp(keypoints, "left_ankle", 15);
        const rightHip = getKp(keypoints, "right_hip", 12);
        const rightKnee = getKp(keypoints, "right_knee", 14);
        const rightAnkle = getKp(keypoints, "right_ankle", 16);

        const leftAngle = calcAngle(leftHip, leftKnee, leftAnkle);
        const rightAngle = calcAngle(rightHip, rightKnee, rightAnkle);

        let angle = null;
        if (leftAngle && rightAngle) angle = (leftAngle + rightAngle) / 2;
        else if (leftAngle) angle = leftAngle;
        else if (rightAngle) angle = rightAngle;

        if (angle == null) {
          setFormFeedback("Adjust camera - can't see full body");
          setFormQuality(0);
          setKneeAngle("--");
        } else {
          angleWindow.current.push(angle);
          if (angleWindow.current.length > WINDOW_SIZE) angleWindow.current.shift();
          const avgAngle = Math.round(angleWindow.current.reduce((a, b) => a + b, 0) / angleWindow.current.length);
          setKneeAngle(avgAngle);

          let quality = 0;
          let feedback = "";

          if (avgAngle < 40) {
            feedback = "⚠️ Too deep! Risk of knee injury. Come up a bit.";
            quality = 20;
          } else if (avgAngle < 90) {
            feedback = "🔥 Perfect depth! Explosive push-up now!";
            quality = 100;
          } else if (avgAngle > 155) {
            feedback = "✅ Stand tall. Ready for next rep!";
            quality = 80;
          } else {
            feedback = "💪 Good form. Keep chest up, control speed.";
            quality = 70;
          }

          setFormFeedback(feedback);
          setFormQuality(quality);

          const now = Date.now();
          const BOTTOM_ANGLE = 90;
          const TOP_ANGLE = 155;
          const COOLDOWN = 700;

          if (avgAngle <= BOTTOM_ANGLE && repState.current === "up") {
            repState.current = "down";
          }
          if (avgAngle >= TOP_ANGLE && repState.current === "down" && now - lastRepTime.current > COOLDOWN) {
            lastRepTime.current = now;
            repState.current = "up";
            setReps((r) => r + 1);
            setFormFeedback("✨ Rep counted! Excellent!");
          }
        }
      }
    } catch (err) {
      console.error("Detection error:", err);
    }

    rafRef.current = requestAnimationFrame(detectPose);
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 20
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '12px 24px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 12,
            color: '#fca5a5',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: 32,
            fontWeight: 900,
            margin: 0,
            background: exercise.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {exercise.name}
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: 14 }}>
            {status}
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: 24
      }}>
        {/* Video Section */}
        <div>
          <div style={{
            position: 'relative',
            borderRadius: 24,
            overflow: 'hidden',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
          }}>
            <video ref={videoRef} width={640} height={480} playsInline style={{ display: 'block', transform: 'scaleX(-1)' }} />
            <canvas ref={canvasRef} width={640} height={480} style={{ position: 'absolute', left: 0, top: 0 }} />

            {/* Stats Overlay - Top */}
            <div style={{
              position: 'absolute',
              top: 20,
              left: 20,
              right: 20,
              display: 'flex',
              gap: 12
            }}>
              {/* Reps Card */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                padding: '16px 20px',
                borderRadius: 16,
                border: `1px solid ${exercise.color}40`,
                boxShadow: `0 8px 32px ${exercise.color}40`
              }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>REPS</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: exercise.color }}>{reps}</div>
              </div>

              {/* Angle Card */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                padding: '16px 20px',
                borderRadius: 16,
                border: '1px solid rgba(148, 163, 184, 0.2)'
              }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>ANGLE</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#4facfe' }}>{kneeAngle}°</div>
              </div>
            </div>

            {/* Form Quality - Right Side */}
            <div style={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: '20px 16px',
              borderRadius: 16,
              border: '1px solid rgba(148, 163, 184, 0.2)',
              width: 140
            }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
                FORM QUALITY
              </div>
              <div style={{
                position: 'relative',
                width: '100%',
                height: 180,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}>
                {/* Vertical Progress Bar */}
                <div style={{
                  width: 40,
                  height: 180,
                  background: 'rgba(148, 163, 184, 0.2)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    height: `${formQuality}%`,
                    background: formQuality > 80 
                      ? 'linear-gradient(to top, #22c55e, #10b981)'
                      : formQuality > 50 
                      ? 'linear-gradient(to top, #facc15, #fbbf24)'
                      : 'linear-gradient(to top, #ef4444, #dc2626)',
                    borderRadius: 20,
                    transition: 'height 0.3s ease'
                  }}/>
                </div>
                <div style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: formQuality > 80 ? '#22c55e' : formQuality > 50 ? '#facc15' : '#ef4444'
                }}>
                  {formQuality}%
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Bar */}
          <div style={{
            marginTop: 20,
            padding: 20,
            background: exercise.gradient,
            borderRadius: 20,
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 800,
            color: 'white',
            boxShadow: `0 12px 40px ${exercise.color}60`
          }}>
            {formFeedback}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Session Stats */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            padding: 24,
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 800,
              margin: '0 0 20px 0',
              color: '#f1f5f9'
            }}>
              Session Stats
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>⏱️ Duration</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#4facfe' }}>
                  {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>🔥 Calories</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fa709a' }}>{calories}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>💪 Avg Form</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#22c55e' }}>{formQuality}%</div>
              </div>
            </div>
          </div>

          {/* Form Tips */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            padding: 24,
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 800,
              margin: '0 0 16px 0',
              color: '#f1f5f9'
            }}>
              Form Tips
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: 20,
              fontSize: 13,
              color: '#cbd5e1',
              lineHeight: 2
            }}>
              {exercise.keyPoints.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>

          {/* System Status */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            padding: 24,
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 800,
              margin: '0 0 16px 0',
              color: '#f1f5f9'
            }}>
              System Status
            </h3>
            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 2 }}>
              <div>Model: <span style={{ color: '#4facfe', fontWeight: 700 }}>MoveNet Lightning</span></div>
              <div>Detection: <span style={{ color: '#22c55e', fontWeight: 700 }}>Active</span></div>
              <div>FPS: <span style={{ color: '#facc15', fontWeight: 700 }}>~30</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const Workout = () => {
  const [selectedExercise, setSelectedExercise] = useState(null);

  if (selectedExercise) {
    return <WorkoutSession exercise={selectedExercise} onBack={() => setSelectedExercise(null)} />;
  }

  return <ExerciseSelection onSelectExercise={setSelectedExercise} />;
};

export default Workout;