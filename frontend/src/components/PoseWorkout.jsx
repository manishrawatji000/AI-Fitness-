// frontend/src/components/PoseWorkout.jsx
import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";

/*
Updated PoseWorkout:
- SINGLE large bottom feedback bar (no overlap)
- Reps box moved to top-right of video container
- Knee angle shown under reps
- Other behaviors (smoothing, rep counting, backend setup) kept
*/

const getKp = (keypoints, name, idxFallback) => {
  if (!keypoints || keypoints.length === 0) return null;
  if (keypoints[0] && keypoints[0].name) {
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
  let cos = dot / (magAB * magCB);
  cos = Math.min(1, Math.max(-1, cos));
  return (Math.acos(cos) * 180) / Math.PI;
};

export default function PoseWorkout() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);

  const [status, setStatus] = useState("Loading model...");
  const [reps, setReps] = useState(0);
  const [formFeedback, setFormFeedback] = useState("Move into frame");
  const [kneeAngleDisplay, setKneeAngleDisplay] = useState("--");

  // internal state refs
  const repState = useRef("up"); // "up" or "down"
  const lastRepTime = useRef(0);

  // smoothing moving average
  const angleWindow = useRef([]);
  const WINDOW_SIZE = 6;

  // thresholds
  let BOTTOM_ANGLE = 90;
  let TOP_ANGLE = 155;
  const COOLDOWN_MS = 700;

  useEffect(() => {
    let mounted = true;

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
          console.warn("webgl backend failed; continuing with tf.ready()", err);
          await tf.ready();
        }

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );

        detectorRef.current = detector;
        setStatus("Model loaded — do your squats");
        rafRef.current = requestAnimationFrame(detectPose);
      } catch (err) {
        console.error("camera/model error", err);
        setStatus("Camera or model failed: " + (err.message || err));
      }
    };

    init();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
      if (detectorRef.current && detectorRef.current.dispose) {
        try { detectorRef.current.dispose(); } catch (e) { /* ignore */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawKeypoints = (ctx, keypoints) => {
    if (!keypoints) return;
    keypoints.forEach((kp) => {
      if (!kp) return;
      if (kp.score != null && kp.score < 0.3) return;
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#34d399";
      ctx.fill();
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
        setFormFeedback("No person detected — move into frame.");
        setKneeAngleDisplay("--");
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

        let kneeAngle = null;
        if (leftAngle && rightAngle) kneeAngle = (leftAngle + rightAngle) / 2;
        else if (leftAngle) kneeAngle = leftAngle;
        else if (rightAngle) kneeAngle = rightAngle;

        if (kneeAngle == null) {
          setFormFeedback("Hips/knees/ankles not visible. Adjust camera.");
          setKneeAngleDisplay("--");
        } else {
          angleWindow.current.push(kneeAngle);
          if (angleWindow.current.length > WINDOW_SIZE) angleWindow.current.shift();
          const avgAngle = Math.round(angleWindow.current.reduce((a, b) => a + b, 0) / angleWindow.current.length);
          setKneeAngleDisplay(avgAngle);

          if (avgAngle < 40) setFormFeedback("Too deep — stop a bit higher to protect knees.");
          else if (avgAngle < BOTTOM_ANGLE) setFormFeedback("Good depth — push up with chest.");
          else if (avgAngle > TOP_ANGLE) setFormFeedback("Stand tall; prepare for next rep.");
          else setFormFeedback("Controlled. Keep breathing, keep chest up.");

          const now = Date.now();
          if (avgAngle <= BOTTOM_ANGLE && repState.current === "up") {
            repState.current = "down";
          }
          if (avgAngle >= TOP_ANGLE && repState.current === "down" && now - lastRepTime.current > COOLDOWN_MS) {
            lastRepTime.current = now;
            repState.current = "up";
            setReps((r) => r + 1);
            setFormFeedback("Nice rep! Keep the pace.");
          }
        }
      }
    } catch (err) {
      console.error("pose detection error", err);
      setStatus("Pose error: " + (err.message || err));
    }

    rafRef.current = requestAnimationFrame(detectPose);
  };

  // styles
  const videoContainerStyle = {
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid rgba(148,163,184,0.06)",
    position: "relative", // important for absolute positioned reps box
    width: 640,
  };

  const repsBoxStyle = {
    position: "absolute",
    top: 12,
    right: 12,
    background: "rgba(2,6,23,0.75)",
    padding: "8px 12px",
    borderRadius: 10,
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
    border: "1px solid rgba(148,163,184,0.06)",
    zIndex: 10,
    minWidth: 72,
  };

  const kneeStyle = { fontSize: 12, color: "#cbd5e1", marginTop: 6 };

  const feedbackBarStyle = {
    position: "fixed",
    left: 20,
    right: 20,
    bottom: 28,
    zIndex: 9999,
    fontSize: 22,
    lineHeight: "1.3",
    fontWeight: 800,
    color: "#ffffff",
    textAlign: "center",
    padding: "14px 18px",
    borderRadius: 14,
    background: "linear-gradient(90deg, rgba(2,6,23,0.95), rgba(6,30,60,0.75))",
    boxShadow: "0 18px 50px rgba(2,6,23,0.6)",
    border: "1px solid rgba(148,163,184,0.08)",
    maxWidth: "calc(100% - 40px)",
    margin: "0 auto",
  };

  return (
    <>
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <div style={videoContainerStyle}>
            <video ref={videoRef} width={640} height={480} playsInline style={{ display: "block", transform: "scaleX(-1)" }} />
            <canvas ref={canvasRef} width={640} height={480} style={{ position: "absolute", left: 0, top: 0 }} />

            {/* REPS box now inside top-right of video */}
            <div style={repsBoxStyle}>
              <div style={{ color: "#9ca3af", fontSize: 11 }}>REPS</div>
              <div style={{ fontSize: 28, color: "#34d399", fontWeight: 800 }}>{reps}</div>
              <div style={kneeStyle}>Knee: <span style={{ color: "#a5b4fc", fontWeight: 700 }}>{kneeAngleDisplay}°</span></div>
            </div>
          </div>

          {/* removed the small inline form-feedback here to avoid overlap; the big fixed bar shows feedback */}
        </div>

        <div style={{ width: 300 }}>
          <div style={{ fontSize: 13, color: "#93c5fd", marginBottom: 6 }}>Status</div>
          <div style={{ color: "#9ca3af", fontSize: 13 }}>{status}</div>
          <div style={{ height: 18 }} />
          <div style={{ fontSize: 13, color: "#93c5fd", marginBottom: 6 }}>Tips</div>
          <ul style={{ color: "#9ca3af", fontSize: 13, paddingLeft: 18 }}>
            <li>Make sure hips, knees and ankles are visible.</li>
            <li>Good lighting increases detection stability.</li>
            <li>If reps miscount, adjust thresholds in the file.</li>
          </ul>
        </div>
      </div>

      {/* SINGLE large fixed feedback bar at bottom (no duplicates) */}
      <div style={feedbackBarStyle}>{formFeedback}</div>
    </>
  );
}
