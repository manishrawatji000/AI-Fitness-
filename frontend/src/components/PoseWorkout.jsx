// frontend/src/components/PoseWorkout.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";

// ─────────────────────────────────────────────────────────────────────────────
// EXERCISE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
const EXERCISES = [
  {
    id: "squat",
    name: "Squats",
    icon: "🏋️",
    description: "Stand shoulder-width apart, lower hips until thighs are parallel to floor.",
    targetMuscles: "Quads · Glutes · Hamstrings",
    color: "#22c55e",
  },
  {
    id: "pushup",
    name: "Push-Ups",
    icon: "💪",
    description: "Keep body straight, lower chest to floor, push back up.",
    targetMuscles: "Chest · Triceps · Shoulders",
    color: "#3b82f6",
  },
  {
    id: "lunge",
    name: "Lunges",
    icon: "🦵",
    description: "Step forward, lower back knee toward floor, keep front knee above ankle.",
    targetMuscles: "Quads · Glutes · Calves",
    color: "#f59e0b",
  },
  {
    id: "bicep_curl",
    name: "Bicep Curls",
    icon: "🤸",
    description: "Keep elbows close to body, curl wrists toward shoulders.",
    targetMuscles: "Biceps · Forearms",
    color: "#ec4899",
  },
  {
    id: "shoulder_press",
    name: "Shoulder Press",
    icon: "🙆",
    description: "Push arms straight overhead, fully extend, then lower to ear level.",
    targetMuscles: "Deltoids · Triceps · Traps",
    color: "#8b5cf6",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    icon: "⚡",
    description: "Hinge at hips, keep back flat, stand tall by extending hips and knees.",
    targetMuscles: "Hamstrings · Back · Glutes",
    color: "#ef4444",
  },
  {
    id: "jumping_jack",
    name: "Jumping Jacks",
    icon: "⭐",
    description: "Jump feet wide while raising arms overhead, then return to start.",
    targetMuscles: "Full Body · Cardio",
    color: "#06b6d4",
  },
  {
    id: "side_lateral_raise",
    name: "Lateral Raises",
    icon: "🦅",
    description: "Raise arms straight out to sides until shoulder height, then lower.",
    targetMuscles: "Lateral Deltoids · Traps",
    color: "#f97316",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getKp = (keypoints, name, idx) => {
  if (!keypoints || keypoints.length === 0) return null;
  if (keypoints[0]?.name) return keypoints.find((k) => k.name === name) || keypoints[idx] || null;
  return keypoints[idx] || null;
};

const calcAngle = (A, B, C) => {
  if (!A || !B || !C) return null;
  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };
  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.hypot(AB.x, AB.y);
  const magCB = Math.hypot(CB.x, CB.y);
  if (magAB === 0 || magCB === 0) return null;
  return (Math.acos(Math.min(1, Math.max(-1, dot / (magAB * magCB)))) * 180) / Math.PI;
};

const midpoint = (A, B) => ({ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 });

const avgAngle = (a, b) => {
  if (a != null && b != null) return (a + b) / 2;
  return a ?? b ?? null;
};

const smoothAngle = (window, value, size = 5) => {
  window.push(value);
  if (window.length > size) window.shift();
  return Math.round(window.reduce((s, v) => s + v, 0) / window.length);
};

// ─────────────────────────────────────────────────────────────────────────────
// EXERCISE ANALYZERS — each returns { metrics, feedback, repTriggered }
// ─────────────────────────────────────────────────────────────────────────────
function analyzeSquat(kp, state, angleWin) {
  const lh = getKp(kp, "left_hip", 11), rh = getKp(kp, "right_hip", 12);
  const lk = getKp(kp, "left_knee", 13), rk = getKp(kp, "right_knee", 14);
  const la = getKp(kp, "left_ankle", 15), ra = getKp(kp, "right_ankle", 16);
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);

  const lKneeAngle = calcAngle(lh, lk, la);
  const rKneeAngle = calcAngle(rh, rk, ra);
  const kneeAngle = avgAngle(lKneeAngle, rKneeAngle);

  // Hip angle (for back posture)
  const lHipAngle = calcAngle(ls, lh, lk);
  const rHipAngle = calcAngle(rs, rh, rk);
  const hipAngle = avgAngle(lHipAngle, rHipAngle);

  if (kneeAngle == null) return { metrics: null, feedback: "Move hips/knees/ankles into frame.", repTriggered: false };

  const smooth = smoothAngle(angleWin, kneeAngle);
  const depth = Math.round(Math.max(0, Math.min(100, ((180 - smooth) / 90) * 100)));

  // Back posture check
  const backPosture = hipAngle != null ? (hipAngle > 50 && hipAngle < 120 ? "correct" : "incorrect") : "unknown";

  // Knee alignment (knees over toes – approximate by comparing knee x to hip x)
  let kneeAlignment = "correct";
  if (lk && lh && Math.abs(lk.x - lh.x) < 0.05 * 640) kneeAlignment = "check";

  const feedback = [];
  let repTriggered = false;

  if (smooth < 40) feedback.push("Too deep — stop higher to protect knees.");
  else if (smooth < 90) {
    feedback.push("Good depth! Drive through heels to stand.");
    if (state.current === "up") { state.current = "down"; }
  } else if (smooth > 160) {
    feedback.push("Stand tall — prepare for next rep.");
    if (state.current === "down") { state.current = "up"; repTriggered = true; }
  } else {
    feedback.push("Controlled descent — keep chest up.");
  }

  if (hipAngle != null && hipAngle < 50) feedback.push("Keep chest up — avoid excessive forward lean.");
  if (hipAngle != null && hipAngle > 130) feedback.push("Lean forward slightly at bottom of squat.");

  return {
    metrics: [
      { label: "Squat Depth", value: `${depth}%`, status: depth > 60 ? "good" : depth > 40 ? "ok" : "warn" },
      { label: "Back Posture", value: backPosture, status: backPosture === "correct" ? "good" : "warn" },
      { label: "Knee Angle", value: `${smooth}°`, status: smooth < 40 ? "warn" : "good" },
      { label: "Knee Alignment", value: kneeAlignment, status: kneeAlignment === "correct" ? "good" : "ok" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzePushUp(kp, state, angleWin) {
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);
  const le = getKp(kp, "left_elbow", 7), re = getKp(kp, "right_elbow", 8);
  const lw = getKp(kp, "left_wrist", 9), rw = getKp(kp, "right_wrist", 10);
  const lh = getKp(kp, "left_hip", 11), rh = getKp(kp, "right_hip", 12);
  const la = getKp(kp, "left_ankle", 15), ra = getKp(kp, "right_ankle", 16);

  const lElbowAngle = calcAngle(ls, le, lw);
  const rElbowAngle = calcAngle(rs, re, rw);
  const elbowAngle = avgAngle(lElbowAngle, rElbowAngle);

  // Body alignment: shoulder-hip-ankle
  const lBodyAngle = calcAngle(ls, lh, la);
  const rBodyAngle = calcAngle(rs, rh, ra);
  const bodyAngle = avgAngle(lBodyAngle, rBodyAngle);

  if (elbowAngle == null) return { metrics: null, feedback: "Show full arms in frame (side view preferred).", repTriggered: false };

  const smooth = smoothAngle(angleWin, elbowAngle);
  const bodyAlignment = bodyAngle != null ? (bodyAngle > 160 ? "straight" : bodyAngle > 140 ? "slight sag" : "sagging") : "unknown";

  let repTriggered = false;
  const feedback = [];

  if (smooth < 90) {
    feedback.push("Great depth! Push up powerfully.");
    if (state.current === "up") state.current = "down";
  } else if (smooth > 160) {
    feedback.push("Arms extended — lower with control.");
    if (state.current === "down") { state.current = "up"; repTriggered = true; }
  } else {
    feedback.push("Halfway — keep going or push back up.");
  }

  if (bodyAlignment === "sagging") feedback.push("Engage core — body is sagging.");
  else if (bodyAlignment === "slight sag") feedback.push("Almost there — tighten core slightly.");

  return {
    metrics: [
      { label: "Elbow Angle", value: `${smooth}°`, status: smooth < 90 ? "good" : "ok" },
      { label: "Body Alignment", value: bodyAlignment, status: bodyAlignment === "straight" ? "good" : "warn" },
      { label: "Depth", value: smooth < 90 ? "full" : smooth < 130 ? "partial" : "top", status: smooth < 90 ? "good" : "ok" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzeLunge(kp, state, angleWin) {
  const lh = getKp(kp, "left_hip", 11), rh = getKp(kp, "right_hip", 12);
  const lk = getKp(kp, "left_knee", 13), rk = getKp(kp, "right_knee", 14);
  const la = getKp(kp, "left_ankle", 15), ra = getKp(kp, "right_ankle", 16);
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);

  // front knee angle
  const frontKneeAngle = calcAngle(lh, lk, la) ?? calcAngle(rh, rk, ra);
  if (frontKneeAngle == null) return { metrics: null, feedback: "Show full legs in frame.", repTriggered: false };

  const smooth = smoothAngle(angleWin, frontKneeAngle);

  // Torso uprightness
  const torsoAngle = calcAngle(ls ?? rs, lh ?? rh, lk ?? rk);
  const torsoUpright = torsoAngle != null ? (torsoAngle > 160 ? "upright" : torsoAngle > 140 ? "slight lean" : "leaning") : "unknown";

  // Knee over ankle check
  let kneeOverAnkle = "ok";
  if (lk && la && Math.abs(lk.x - la.x) > 0.1 * 640) kneeOverAnkle = "too far forward";

  let repTriggered = false;
  const feedback = [];

  if (smooth < 95) {
    feedback.push("Good lunge depth — 90° front knee!");
    if (state.current === "up") state.current = "down";
  } else if (smooth > 160) {
    feedback.push("Stand up straight — prepare next lunge.");
    if (state.current === "down") { state.current = "up"; repTriggered = true; }
  } else {
    feedback.push("Lower back knee closer to ground.");
  }

  if (torsoUpright === "leaning") feedback.push("Keep torso upright — don't hunch forward.");
  if (kneeOverAnkle === "too far forward") feedback.push("Front knee shouldn't go past toes.");

  return {
    metrics: [
      { label: "Front Knee Angle", value: `${smooth}°`, status: smooth < 100 ? "good" : "ok" },
      { label: "Torso Position", value: torsoUpright, status: torsoUpright === "upright" ? "good" : "warn" },
      { label: "Knee Over Ankle", value: kneeOverAnkle, status: kneeOverAnkle === "ok" ? "good" : "warn" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzeBicepCurl(kp, state, angleWin) {
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);
  const le = getKp(kp, "left_elbow", 7), re = getKp(kp, "right_elbow", 8);
  const lw = getKp(kp, "left_wrist", 9), rw = getKp(kp, "right_wrist", 10);

  const lAngle = calcAngle(ls, le, lw);
  const rAngle = calcAngle(rs, re, rw);
  const elbowAngle = avgAngle(lAngle, rAngle);

  if (elbowAngle == null) return { metrics: null, feedback: "Show full arms in frame.", repTriggered: false };

  const smooth = smoothAngle(angleWin, elbowAngle);
  const rangeOfMotion = Math.round(Math.max(0, Math.min(100, ((160 - smooth) / 120) * 100)));

  // Elbow drift — elbows should stay close to torso
  let elbowStability = "stable";
  if (le && ls && Math.abs(le.x - ls.x) > 0.15 * 640) elbowStability = "drifting";

  let repTriggered = false;
  const feedback = [];

  if (smooth < 50) {
    feedback.push("Full contraction! Lower slowly.");
    if (state.current === "down") state.current = "up";
  } else if (smooth > 150) {
    feedback.push("Curl up — squeeze at the top.");
    if (state.current === "up") { state.current = "down"; }
  } else if (smooth > 140) {
    if (state.current === "up") { state.current = "down"; repTriggered = true; }
    feedback.push("Good rep! Curl again.");
  } else {
    feedback.push("Keep curling — full range of motion.");
  }

  if (elbowStability === "drifting") feedback.push("Keep elbows tucked at your sides.");

  return {
    metrics: [
      { label: "Elbow Angle", value: `${smooth}°`, status: smooth < 60 ? "good" : "ok" },
      { label: "Range of Motion", value: `${rangeOfMotion}%`, status: rangeOfMotion > 70 ? "good" : "warn" },
      { label: "Elbow Stability", value: elbowStability, status: elbowStability === "stable" ? "good" : "warn" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzeShoulderPress(kp, state, angleWin) {
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);
  const le = getKp(kp, "left_elbow", 7), re = getKp(kp, "right_elbow", 8);
  const lw = getKp(kp, "left_wrist", 9), rw = getKp(kp, "right_wrist", 10);

  const lAngle = calcAngle(ls, le, lw);
  const rAngle = calcAngle(rs, re, rw);
  const elbowAngle = avgAngle(lAngle, rAngle);

  if (elbowAngle == null) return { metrics: null, feedback: "Show shoulders and arms in frame.", repTriggered: false };

  const smooth = smoothAngle(angleWin, elbowAngle);

  // Wrist above elbow check (overhead press)
  let wristPosition = "ok";
  if (lw && le && lw.y < le.y) wristPosition = "overhead";
  else if (rw && re && rw.y < re.y) wristPosition = "overhead";

  let repTriggered = false;
  const feedback = [];

  if (smooth > 160) {
    feedback.push("Arms fully extended — lower to ear level.");
    if (state.current === "down") { state.current = "up"; repTriggered = true; }
  } else if (smooth < 90) {
    feedback.push("Press up explosively!");
    if (state.current === "up") state.current = "down";
  } else {
    feedback.push("Keep pressing — full extension overhead.");
  }

  return {
    metrics: [
      { label: "Elbow Angle", value: `${smooth}°`, status: smooth > 160 ? "good" : "ok" },
      { label: "Press Progress", value: smooth > 160 ? "full" : smooth > 120 ? "mid" : "start", status: smooth > 150 ? "good" : "ok" },
      { label: "Wrist Position", value: wristPosition, status: wristPosition === "overhead" ? "good" : "ok" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzeDeadlift(kp, state, angleWin) {
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);
  const lh = getKp(kp, "left_hip", 11), rh = getKp(kp, "right_hip", 12);
  const lk = getKp(kp, "left_knee", 13), rk = getKp(kp, "right_knee", 14);
  const la = getKp(kp, "left_ankle", 15), ra = getKp(kp, "right_ankle", 16);

  const lHipAngle = calcAngle(ls, lh, lk);
  const rHipAngle = calcAngle(rs, rh, rk);
  const hipAngle = avgAngle(lHipAngle, rHipAngle);

  const lKneeAngle = calcAngle(lh, lk, la);
  const rKneeAngle = calcAngle(rh, rk, ra);
  const kneeAngle = avgAngle(lKneeAngle, rKneeAngle);

  if (hipAngle == null) return { metrics: null, feedback: "Show full body in side view.", repTriggered: false };

  const smooth = smoothAngle(angleWin, hipAngle);

  // Back flatness approximation
  const backFlat = smooth > 140 ? "flat" : smooth > 110 ? "slight rounding" : "rounded";

  let repTriggered = false;
  const feedback = [];

  if (smooth > 165) {
    feedback.push("Standing tall! Hinge back down with control.");
    if (state.current === "down") { state.current = "up"; repTriggered = true; }
  } else if (smooth < 90) {
    feedback.push("Drive hips forward to stand — squeeze glutes.");
    if (state.current === "up") state.current = "down";
  } else {
    feedback.push("Continue extending hips and knees together.");
  }

  if (backFlat === "rounded") feedback.push("⚠️ Keep back flat — risk of injury!");
  else if (backFlat === "slight rounding") feedback.push("Brace core and straighten back.");

  return {
    metrics: [
      { label: "Hip Angle", value: `${smooth}°`, status: smooth > 160 ? "good" : "ok" },
      { label: "Back Position", value: backFlat, status: backFlat === "flat" ? "good" : "warn" },
      { label: "Knee Angle", value: kneeAngle ? `${Math.round(kneeAngle)}°` : "--", status: "ok" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzeJumpingJack(kp, state, angleWin) {
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);
  const lw = getKp(kp, "left_wrist", 9), rw = getKp(kp, "right_wrist", 10);
  const lh = getKp(kp, "left_hip", 11), rh = getKp(kp, "right_hip", 12);
  const la = getKp(kp, "left_ankle", 15), ra = getKp(kp, "right_ankle", 16);

  // Arm raise angle
  const lArmAngle = calcAngle({ x: ls?.x ?? 0, y: (ls?.y ?? 0) + 50 }, ls, lw);
  const rArmAngle = calcAngle({ x: rs?.x ?? 0, y: (rs?.y ?? 0) + 50 }, rs, rw);
  const armAngle = avgAngle(lArmAngle, rArmAngle);

  // Leg spread
  let legSpread = 0;
  if (la && ra && lh && rh) {
    const hipWidth = Math.abs(lh.x - rh.x);
    const ankleWidth = Math.abs(la.x - ra.x);
    legSpread = Math.round(Math.min(100, (ankleWidth / (hipWidth * 2.5)) * 100));
  }

  if (armAngle == null) return { metrics: null, feedback: "Show full body in frame for jumping jacks.", repTriggered: false };

  const smooth = smoothAngle(angleWin, armAngle);

  let repTriggered = false;
  const feedback = [];

  if (smooth > 120 && legSpread > 50) {
    feedback.push("Arms up, legs wide — great form!");
    if (state.current === "closed") state.current = "open";
  } else if (smooth < 40 && legSpread < 30) {
    feedback.push("Jump out and raise arms simultaneously.");
    if (state.current === "open") { state.current = "closed"; repTriggered = true; }
  } else {
    feedback.push("Keep the rhythm — arms and legs together!");
  }

  return {
    metrics: [
      { label: "Arm Raise", value: `${smooth}°`, status: smooth > 110 ? "good" : "ok" },
      { label: "Leg Spread", value: `${legSpread}%`, status: legSpread > 50 ? "good" : "ok" },
      { label: "Sync", value: smooth > 90 && legSpread > 40 ? "synced" : "off-sync", status: smooth > 90 && legSpread > 40 ? "good" : "warn" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzeLateralRaise(kp, state, angleWin) {
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);
  const le = getKp(kp, "left_elbow", 7), re = getKp(kp, "right_elbow", 8);
  const lw = getKp(kp, "left_wrist", 9), rw = getKp(kp, "right_wrist", 10);

  // Arm elevation angle relative to torso
  const lAngle = calcAngle({ x: ls?.x ?? 0, y: (ls?.y ?? 0) + 100 }, ls, lw);
  const rAngle = calcAngle({ x: rs?.x ?? 0, y: (rs?.y ?? 0) + 100 }, rs, rw);
  const armAngle = avgAngle(lAngle, rAngle);

  // Elbow bend (should be slight, ~160°)
  const lElbow = calcAngle(ls, le, lw);
  const rElbow = calcAngle(rs, re, rw);
  const elbowBend = avgAngle(lElbow, rElbow);

  if (armAngle == null) return { metrics: null, feedback: "Show shoulders and arms in frame.", repTriggered: false };

  const smooth = smoothAngle(angleWin, armAngle);

  let repTriggered = false;
  const feedback = [];

  if (smooth > 80) {
    feedback.push("Arms at shoulder level — perfect raise!");
    if (state.current === "down") state.current = "up";
  } else if (smooth < 20) {
    feedback.push("Lower arms back — control the descent.");
    if (state.current === "up") { state.current = "down"; repTriggered = true; }
  } else {
    feedback.push("Raise arms out to the sides — lead with elbows.");
  }

  if (elbowBend != null && elbowBend < 130) feedback.push("Keep arms almost straight — slight elbow bend only.");

  return {
    metrics: [
      { label: "Arm Elevation", value: `${smooth}°`, status: smooth > 70 ? "good" : "ok" },
      { label: "Elbow Bend", value: elbowBend ? `${Math.round(elbowBend)}°` : "--", status: elbowBend && elbowBend > 150 ? "good" : "ok" },
      { label: "Height", value: smooth > 80 ? "shoulder level" : smooth > 50 ? "mid" : "low", status: smooth > 70 ? "good" : "warn" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

const ANALYZERS = {
  squat: analyzeSquat,
  pushup: analyzePushUp,
  lunge: analyzeLunge,
  bicep_curl: analyzeBicepCurl,
  shoulder_press: analyzeShoulderPress,
  deadlift: analyzeDeadlift,
  jumping_jack: analyzeJumpingJack,
  side_lateral_raise: analyzeLateralRaise,
};

// State init per exercise (some need different initial state)
const initState = (id) => {
  if (id === "jumping_jack") return { current: "closed" };
  if (id === "bicep_curl") return { current: "up" };
  return { current: "up" };
};

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS DRAWING
// ─────────────────────────────────────────────────────────────────────────────
const SKELETON_PAIRS = [
  [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],
  [5, 11], [6, 12], [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
];

function drawPose(ctx, keypoints, color = "#22c55e") {
  if (!keypoints) return;

  // Draw skeleton
  SKELETON_PAIRS.forEach(([a, b]) => {
    const kpA = keypoints[a], kpB = keypoints[b];
    if (!kpA || !kpB) return;
    if ((kpA.score ?? 1) < 0.25 || (kpB.score ?? 1) < 0.25) return;
    ctx.beginPath();
    ctx.moveTo(kpA.x, kpA.y);
    ctx.lineTo(kpB.x, kpB.y);
    ctx.strokeStyle = `${color}88`;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });

  // Draw joints
  keypoints.forEach((kp) => {
    if (!kp || (kp.score ?? 1) < 0.25) return;
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#020617";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function PoseWorkout() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const repState = useRef({ current: "up" });
  const lastRepTime = useRef(0);
  const angleWindow = useRef([]);

  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [status, setStatus] = useState("Loading model…");
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState("Get into position…");
  const [metrics, setMetrics] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Reset when exercise changes
  const selectExercise = useCallback((ex) => {
    setSelectedExercise(ex);
    setReps(0);
    setFeedback("Get into position…");
    setMetrics(null);
    repState.current = initState(ex.id);
    angleWindow.current = [];
    lastRepTime.current = 0;
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);

        try { await tf.setBackend("webgl"); await tf.ready(); }
        catch { await tf.ready(); }

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER }
        );
        detectorRef.current = detector;
        setStatus("AI Trainer Active");
        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        setStatus("Camera/model error: " + (err.message || err));
      }
    };

    init();
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
      try { detectorRef.current?.dispose(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedExRef = useRef(selectedExercise);
  useEffect(() => { selectedExRef.current = selectedExercise; }, [selectedExercise]);

  const repsRef = useRef(0);
  const loop = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current) { rafRef.current = requestAnimationFrame(loop); return; }
    try {
      const poses = await detectorRef.current.estimatePoses(videoRef.current, { maxPoses: 1, flipHorizontal: true });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      if (poses?.length > 0) {
        const ex = selectedExRef.current;
        drawPose(ctx, poses[0].keypoints, ex.color);
        const analyze = ANALYZERS[ex.id];
        if (analyze) {
          const result = analyze(poses[0].keypoints, repState.current, angleWindow.current);
          if (result.metrics) setMetrics(result.metrics);
          setFeedback(result.feedback || "Keep going…");

          const now = Date.now();
          if (result.repTriggered && now - lastRepTime.current > 700) {
            lastRepTime.current = now;
            repsRef.current += 1;
            setReps(repsRef.current);
          }
        }
      } else {
        setFeedback("No person detected — step into frame.");
        setMetrics(null);
      }
    } catch (err) {
      console.error("pose error", err);
    }
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const statusColor = { good: "#22c55e", ok: "#f59e0b", warn: "#ef4444" };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* ── Exercise selector ── */}
      <div style={{ marginBottom: 18, overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 8, paddingBottom: 4, width: "max-content" }}>
          {EXERCISES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => selectExercise(ex)}
              style={{
                padding: "8px 14px",
                borderRadius: 12,
                border: `1.5px solid ${selectedExercise.id === ex.id ? ex.color : "rgba(148,163,184,0.3)"}`,
                background: selectedExercise.id === ex.id
                  ? `${ex.color}22`
                  : "rgba(15,23,42,0.6)",
                color: selectedExercise.id === ex.id ? ex.color : "#9ca3af",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: selectedExercise.id === ex.id ? 700 : 400,
                whiteSpace: "nowrap",
                transition: "all 0.18s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{ex.icon}</span>
              <span>{ex.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* Video + Canvas */}
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: `1.5px solid ${selectedExercise.color}44`, flexShrink: 0 }}>
          <video ref={videoRef} width={560} height={420} playsInline
            style={{ display: "block", transform: "scaleX(-1)" }} />
          <canvas ref={canvasRef} width={560} height={420}
            style={{ position: "absolute", left: 0, top: 0 }} />

          {/* Reps overlay */}
          <div style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(2,6,23,0.85)", borderRadius: 12,
            padding: "8px 14px", textAlign: "center",
            border: `1px solid ${selectedExercise.color}66`,
            minWidth: 72,
          }}>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>REPS</div>
            <div style={{ fontSize: 32, color: selectedExercise.color, fontWeight: 800 }}>{reps}</div>
          </div>

          {/* Status pill */}
          <div style={{
            position: "absolute", top: 12, left: 12,
            background: "rgba(2,6,23,0.8)", borderRadius: 999,
            padding: "4px 10px", fontSize: 11, color: "#9ca3af",
            border: "1px solid rgba(148,163,184,0.15)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: cameraReady ? "#22c55e" : "#9ca3af",
              display: "inline-block",
              boxShadow: cameraReady ? "0 0 6px #22c55e" : "none",
            }} />
            {status}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ flex: 1, minWidth: 260 }}>

          {/* Exercise info */}
          <div style={{
            background: "rgba(15,23,42,0.85)",
            borderRadius: 14,
            padding: "14px 16px",
            border: `1px solid ${selectedExercise.color}33`,
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              {selectedExercise.icon} {selectedExercise.name}
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>{selectedExercise.description}</div>
            <div style={{
              display: "inline-block", fontSize: 11, color: selectedExercise.color,
              background: `${selectedExercise.color}18`, padding: "2px 8px", borderRadius: 999,
              border: `1px solid ${selectedExercise.color}44`,
            }}>
              {selectedExercise.targetMuscles}
            </div>
          </div>

          {/* Live metrics */}
          <div style={{
            background: "rgba(15,23,42,0.85)",
            borderRadius: 14, padding: "14px 16px",
            border: "1px solid rgba(148,163,184,0.12)",
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Live Metrics
            </div>
            {metrics ? (
              metrics.map((m) => (
                <div key={m.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 0", borderBottom: "1px solid rgba(148,163,184,0.08)",
                }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{m.label}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: statusColor[m.status] || "#f9fafb",
                    background: `${statusColor[m.status] || "#f9fafb"}18`,
                    padding: "2px 8px", borderRadius: 6,
                  }}>
                    {m.value}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: "#6b7280" }}>Start moving to see metrics…</div>
            )}
          </div>

          {/* Tips */}
          <div style={{
            background: "rgba(15,23,42,0.85)", borderRadius: 14,
            padding: "12px 14px", border: "1px solid rgba(148,163,184,0.1)",
          }}>
            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Tips</div>
            <ul style={{ margin: 0, paddingLeft: 16, color: "#9ca3af", fontSize: 12, lineHeight: 1.7 }}>
              <li>Ensure good lighting on your body.</li>
              <li>Keep all joints visible in frame.</li>
              <li>Side view works best for squats & deadlifts.</li>
              <li>Front view works best for curls & raises.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Feedback bar */}
      <div style={{
        marginTop: 16,
        padding: "14px 20px",
        borderRadius: 14,
        background: `linear-gradient(90deg, ${selectedExercise.color}15, rgba(15,23,42,0.9))`,
        border: `1px solid ${selectedExercise.color}44`,
        fontSize: 16,
        fontWeight: 700,
        color: "#f9fafb",
        lineHeight: 1.4,
        minHeight: 52,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>{selectedExercise.icon}</span>
        <span>{feedback}</span>
      </div>
    </div>
  );
}
// frontend/src/components/PoseWorkout.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";

// ─────────────────────────────────────────────────────────────────────────────
// EXERCISE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
const EXERCISES = [
  {
    id: "squat",
    name: "Squats",
    icon: "🏋️",
    description: "Stand shoulder-width apart, lower hips until thighs are parallel to floor.",
    targetMuscles: "Quads · Glutes · Hamstrings",
    color: "#22c55e",
  },
  {
    id: "pushup",
    name: "Push-Ups",
    icon: "💪",
    description: "Keep body straight, lower chest to floor, push back up.",
    targetMuscles: "Chest · Triceps · Shoulders",
    color: "#3b82f6",
  },
  {
    id: "lunge",
    name: "Lunges",
    icon: "🦵",
    description: "Step forward, lower back knee toward floor, keep front knee above ankle.",
    targetMuscles: "Quads · Glutes · Calves",
    color: "#f59e0b",
  },
  {
    id: "bicep_curl",
    name: "Bicep Curls",
    icon: "🤸",
    description: "Keep elbows close to body, curl wrists toward shoulders.",
    targetMuscles: "Biceps · Forearms",
    color: "#ec4899",
  },
  {
    id: "shoulder_press",
    name: "Shoulder Press",
    icon: "🙆",
    description: "Push arms straight overhead, fully extend, then lower to ear level.",
    targetMuscles: "Deltoids · Triceps · Traps",
    color: "#8b5cf6",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    icon: "⚡",
    description: "Hinge at hips, keep back flat, stand tall by extending hips and knees.",
    targetMuscles: "Hamstrings · Back · Glutes",
    color: "#ef4444",
  },
  {
    id: "jumping_jack",
    name: "Jumping Jacks",
    icon: "⭐",
    description: "Jump feet wide while raising arms overhead, then return to start.",
    targetMuscles: "Full Body · Cardio",
    color: "#06b6d4",
  },
  {
    id: "side_lateral_raise",
    name: "Lateral Raises",
    icon: "🦅",
    description: "Raise arms straight out to sides until shoulder height, then lower.",
    targetMuscles: "Lateral Deltoids · Traps",
    color: "#f97316",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getKp = (keypoints, name, idx) => {
  if (!keypoints || keypoints.length === 0) return null;
  if (keypoints[0]?.name) return keypoints.find((k) => k.name === name) || keypoints[idx] || null;
  return keypoints[idx] || null;
};

const calcAngle = (A, B, C) => {
  if (!A || !B || !C) return null;
  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };
  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.hypot(AB.x, AB.y);
  const magCB = Math.hypot(CB.x, CB.y);
  if (magAB === 0 || magCB === 0) return null;
  return (Math.acos(Math.min(1, Math.max(-1, dot / (magAB * magCB)))) * 180) / Math.PI;
};

const midpoint = (A, B) => ({ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 });

const avgAngle = (a, b) => {
  if (a != null && b != null) return (a + b) / 2;
  return a ?? b ?? null;
};

const smoothAngle = (window, value, size = 5) => {
  window.push(value);
  if (window.length > size) window.shift();
  return Math.round(window.reduce((s, v) => s + v, 0) / window.length);
};

// ─────────────────────────────────────────────────────────────────────────────
// EXERCISE ANALYZERS — each returns { metrics, feedback, repTriggered }
// ─────────────────────────────────────────────────────────────────────────────
function analyzeSquat(kp, state, angleWin) {
  const lh = getKp(kp, "left_hip", 11), rh = getKp(kp, "right_hip", 12);
  const lk = getKp(kp, "left_knee", 13), rk = getKp(kp, "right_knee", 14);
  const la = getKp(kp, "left_ankle", 15), ra = getKp(kp, "right_ankle", 16);
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);

  const lKneeAngle = calcAngle(lh, lk, la);
  const rKneeAngle = calcAngle(rh, rk, ra);
  const kneeAngle = avgAngle(lKneeAngle, rKneeAngle);

  // Hip angle (for back posture)
  const lHipAngle = calcAngle(ls, lh, lk);
  const rHipAngle = calcAngle(rs, rh, rk);
  const hipAngle = avgAngle(lHipAngle, rHipAngle);

  if (kneeAngle == null) return { metrics: null, feedback: "Move hips/knees/ankles into frame.", repTriggered: false };

  const smooth = smoothAngle(angleWin, kneeAngle);
  const depth = Math.round(Math.max(0, Math.min(100, ((180 - smooth) / 90) * 100)));

  // Back posture check
  const backPosture = hipAngle != null ? (hipAngle > 50 && hipAngle < 120 ? "correct" : "incorrect") : "unknown";

  // Knee alignment (knees over toes – approximate by comparing knee x to hip x)
  let kneeAlignment = "correct";
  if (lk && lh && Math.abs(lk.x - lh.x) < 0.05 * 640) kneeAlignment = "check";

  const feedback = [];
  let repTriggered = false;

  if (smooth < 40) feedback.push("Too deep — stop higher to protect knees.");
  else if (smooth < 90) {
    feedback.push("Good depth! Drive through heels to stand.");
    if (state.current === "up") { state.current = "down"; }
  } else if (smooth > 160) {
    feedback.push("Stand tall — prepare for next rep.");
    if (state.current === "down") { state.current = "up"; repTriggered = true; }
  } else {
    feedback.push("Controlled descent — keep chest up.");
  }

  if (hipAngle != null && hipAngle < 50) feedback.push("Keep chest up — avoid excessive forward lean.");
  if (hipAngle != null && hipAngle > 130) feedback.push("Lean forward slightly at bottom of squat.");

  return {
    metrics: [
      { label: "Squat Depth", value: `${depth}%`, status: depth > 60 ? "good" : depth > 40 ? "ok" : "warn" },
      { label: "Back Posture", value: backPosture, status: backPosture === "correct" ? "good" : "warn" },
      { label: "Knee Angle", value: `${smooth}°`, status: smooth < 40 ? "warn" : "good" },
      { label: "Knee Alignment", value: kneeAlignment, status: kneeAlignment === "correct" ? "good" : "ok" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzePushUp(kp, state, angleWin) {
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);
  const le = getKp(kp, "left_elbow", 7), re = getKp(kp, "right_elbow", 8);
  const lw = getKp(kp, "left_wrist", 9), rw = getKp(kp, "right_wrist", 10);
  const lh = getKp(kp, "left_hip", 11), rh = getKp(kp, "right_hip", 12);
  const la = getKp(kp, "left_ankle", 15), ra = getKp(kp, "right_ankle", 16);

  const lElbowAngle = calcAngle(ls, le, lw);
  const rElbowAngle = calcAngle(rs, re, rw);
  const elbowAngle = avgAngle(lElbowAngle, rElbowAngle);

  // Body alignment: shoulder-hip-ankle
  const lBodyAngle = calcAngle(ls, lh, la);
  const rBodyAngle = calcAngle(rs, rh, ra);
  const bodyAngle = avgAngle(lBodyAngle, rBodyAngle);

  if (elbowAngle == null) return { metrics: null, feedback: "Show full arms in frame (side view preferred).", repTriggered: false };

  const smooth = smoothAngle(angleWin, elbowAngle);
  const bodyAlignment = bodyAngle != null ? (bodyAngle > 160 ? "straight" : bodyAngle > 140 ? "slight sag" : "sagging") : "unknown";

  let repTriggered = false;
  const feedback = [];

  if (smooth < 90) {
    feedback.push("Great depth! Push up powerfully.");
    if (state.current === "up") state.current = "down";
  } else if (smooth > 160) {
    feedback.push("Arms extended — lower with control.");
    if (state.current === "down") { state.current = "up"; repTriggered = true; }
  } else {
    feedback.push("Halfway — keep going or push back up.");
  }

  if (bodyAlignment === "sagging") feedback.push("Engage core — body is sagging.");
  else if (bodyAlignment === "slight sag") feedback.push("Almost there — tighten core slightly.");

  return {
    metrics: [
      { label: "Elbow Angle", value: `${smooth}°`, status: smooth < 90 ? "good" : "ok" },
      { label: "Body Alignment", value: bodyAlignment, status: bodyAlignment === "straight" ? "good" : "warn" },
      { label: "Depth", value: smooth < 90 ? "full" : smooth < 130 ? "partial" : "top", status: smooth < 90 ? "good" : "ok" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzeLunge(kp, state, angleWin) {
  const lh = getKp(kp, "left_hip", 11), rh = getKp(kp, "right_hip", 12);
  const lk = getKp(kp, "left_knee", 13), rk = getKp(kp, "right_knee", 14);
  const la = getKp(kp, "left_ankle", 15), ra = getKp(kp, "right_ankle", 16);
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);

  // front knee angle
  const frontKneeAngle = calcAngle(lh, lk, la) ?? calcAngle(rh, rk, ra);
  if (frontKneeAngle == null) return { metrics: null, feedback: "Show full legs in frame.", repTriggered: false };

  const smooth = smoothAngle(angleWin, frontKneeAngle);

  // Torso uprightness
  const torsoAngle = calcAngle(ls ?? rs, lh ?? rh, lk ?? rk);
  const torsoUpright = torsoAngle != null ? (torsoAngle > 160 ? "upright" : torsoAngle > 140 ? "slight lean" : "leaning") : "unknown";

  // Knee over ankle check
  let kneeOverAnkle = "ok";
  if (lk && la && Math.abs(lk.x - la.x) > 0.1 * 640) kneeOverAnkle = "too far forward";

  let repTriggered = false;
  const feedback = [];

  if (smooth < 95) {
    feedback.push("Good lunge depth — 90° front knee!");
    if (state.current === "up") state.current = "down";
  } else if (smooth > 160) {
    feedback.push("Stand up straight — prepare next lunge.");
    if (state.current === "down") { state.current = "up"; repTriggered = true; }
  } else {
    feedback.push("Lower back knee closer to ground.");
  }

  if (torsoUpright === "leaning") feedback.push("Keep torso upright — don't hunch forward.");
  if (kneeOverAnkle === "too far forward") feedback.push("Front knee shouldn't go past toes.");

  return {
    metrics: [
      { label: "Front Knee Angle", value: `${smooth}°`, status: smooth < 100 ? "good" : "ok" },
      { label: "Torso Position", value: torsoUpright, status: torsoUpright === "upright" ? "good" : "warn" },
      { label: "Knee Over Ankle", value: kneeOverAnkle, status: kneeOverAnkle === "ok" ? "good" : "warn" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzeBicepCurl(kp, state, angleWin) {
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);
  const le = getKp(kp, "left_elbow", 7), re = getKp(kp, "right_elbow", 8);
  const lw = getKp(kp, "left_wrist", 9), rw = getKp(kp, "right_wrist", 10);

  const lAngle = calcAngle(ls, le, lw);
  const rAngle = calcAngle(rs, re, rw);
  const elbowAngle = avgAngle(lAngle, rAngle);

  if (elbowAngle == null) return { metrics: null, feedback: "Show full arms in frame.", repTriggered: false };

  const smooth = smoothAngle(angleWin, elbowAngle);
  const rangeOfMotion = Math.round(Math.max(0, Math.min(100, ((160 - smooth) / 120) * 100)));

  // Elbow drift — elbows should stay close to torso
  let elbowStability = "stable";
  if (le && ls && Math.abs(le.x - ls.x) > 0.15 * 640) elbowStability = "drifting";

  let repTriggered = false;
  const feedback = [];

  if (smooth < 50) {
    feedback.push("Full contraction! Lower slowly.");
    if (state.current === "down") state.current = "up";
  } else if (smooth > 150) {
    feedback.push("Curl up — squeeze at the top.");
    if (state.current === "up") { state.current = "down"; }
  } else if (smooth > 140) {
    if (state.current === "up") { state.current = "down"; repTriggered = true; }
    feedback.push("Good rep! Curl again.");
  } else {
    feedback.push("Keep curling — full range of motion.");
  }

  if (elbowStability === "drifting") feedback.push("Keep elbows tucked at your sides.");

  return {
    metrics: [
      { label: "Elbow Angle", value: `${smooth}°`, status: smooth < 60 ? "good" : "ok" },
      { label: "Range of Motion", value: `${rangeOfMotion}%`, status: rangeOfMotion > 70 ? "good" : "warn" },
      { label: "Elbow Stability", value: elbowStability, status: elbowStability === "stable" ? "good" : "warn" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzeShoulderPress(kp, state, angleWin) {
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);
  const le = getKp(kp, "left_elbow", 7), re = getKp(kp, "right_elbow", 8);
  const lw = getKp(kp, "left_wrist", 9), rw = getKp(kp, "right_wrist", 10);

  const lAngle = calcAngle(ls, le, lw);
  const rAngle = calcAngle(rs, re, rw);
  const elbowAngle = avgAngle(lAngle, rAngle);

  if (elbowAngle == null) return { metrics: null, feedback: "Show shoulders and arms in frame.", repTriggered: false };

  const smooth = smoothAngle(angleWin, elbowAngle);

  // Wrist above elbow check (overhead press)
  let wristPosition = "ok";
  if (lw && le && lw.y < le.y) wristPosition = "overhead";
  else if (rw && re && rw.y < re.y) wristPosition = "overhead";

  let repTriggered = false;
  const feedback = [];

  if (smooth > 160) {
    feedback.push("Arms fully extended — lower to ear level.");
    if (state.current === "down") { state.current = "up"; repTriggered = true; }
  } else if (smooth < 90) {
    feedback.push("Press up explosively!");
    if (state.current === "up") state.current = "down";
  } else {
    feedback.push("Keep pressing — full extension overhead.");
  }

  return {
    metrics: [
      { label: "Elbow Angle", value: `${smooth}°`, status: smooth > 160 ? "good" : "ok" },
      { label: "Press Progress", value: smooth > 160 ? "full" : smooth > 120 ? "mid" : "start", status: smooth > 150 ? "good" : "ok" },
      { label: "Wrist Position", value: wristPosition, status: wristPosition === "overhead" ? "good" : "ok" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzeDeadlift(kp, state, angleWin) {
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);
  const lh = getKp(kp, "left_hip", 11), rh = getKp(kp, "right_hip", 12);
  const lk = getKp(kp, "left_knee", 13), rk = getKp(kp, "right_knee", 14);
  const la = getKp(kp, "left_ankle", 15), ra = getKp(kp, "right_ankle", 16);

  const lHipAngle = calcAngle(ls, lh, lk);
  const rHipAngle = calcAngle(rs, rh, rk);
  const hipAngle = avgAngle(lHipAngle, rHipAngle);

  const lKneeAngle = calcAngle(lh, lk, la);
  const rKneeAngle = calcAngle(rh, rk, ra);
  const kneeAngle = avgAngle(lKneeAngle, rKneeAngle);

  if (hipAngle == null) return { metrics: null, feedback: "Show full body in side view.", repTriggered: false };

  const smooth = smoothAngle(angleWin, hipAngle);

  // Back flatness approximation
  const backFlat = smooth > 140 ? "flat" : smooth > 110 ? "slight rounding" : "rounded";

  let repTriggered = false;
  const feedback = [];

  if (smooth > 165) {
    feedback.push("Standing tall! Hinge back down with control.");
    if (state.current === "down") { state.current = "up"; repTriggered = true; }
  } else if (smooth < 90) {
    feedback.push("Drive hips forward to stand — squeeze glutes.");
    if (state.current === "up") state.current = "down";
  } else {
    feedback.push("Continue extending hips and knees together.");
  }

  if (backFlat === "rounded") feedback.push("⚠️ Keep back flat — risk of injury!");
  else if (backFlat === "slight rounding") feedback.push("Brace core and straighten back.");

  return {
    metrics: [
      { label: "Hip Angle", value: `${smooth}°`, status: smooth > 160 ? "good" : "ok" },
      { label: "Back Position", value: backFlat, status: backFlat === "flat" ? "good" : "warn" },
      { label: "Knee Angle", value: kneeAngle ? `${Math.round(kneeAngle)}°` : "--", status: "ok" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzeJumpingJack(kp, state, angleWin) {
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);
  const lw = getKp(kp, "left_wrist", 9), rw = getKp(kp, "right_wrist", 10);
  const lh = getKp(kp, "left_hip", 11), rh = getKp(kp, "right_hip", 12);
  const la = getKp(kp, "left_ankle", 15), ra = getKp(kp, "right_ankle", 16);

  // Arm raise angle
  const lArmAngle = calcAngle({ x: ls?.x ?? 0, y: (ls?.y ?? 0) + 50 }, ls, lw);
  const rArmAngle = calcAngle({ x: rs?.x ?? 0, y: (rs?.y ?? 0) + 50 }, rs, rw);
  const armAngle = avgAngle(lArmAngle, rArmAngle);

  // Leg spread
  let legSpread = 0;
  if (la && ra && lh && rh) {
    const hipWidth = Math.abs(lh.x - rh.x);
    const ankleWidth = Math.abs(la.x - ra.x);
    legSpread = Math.round(Math.min(100, (ankleWidth / (hipWidth * 2.5)) * 100));
  }

  if (armAngle == null) return { metrics: null, feedback: "Show full body in frame for jumping jacks.", repTriggered: false };

  const smooth = smoothAngle(angleWin, armAngle);

  let repTriggered = false;
  const feedback = [];

  if (smooth > 120 && legSpread > 50) {
    feedback.push("Arms up, legs wide — great form!");
    if (state.current === "closed") state.current = "open";
  } else if (smooth < 40 && legSpread < 30) {
    feedback.push("Jump out and raise arms simultaneously.");
    if (state.current === "open") { state.current = "closed"; repTriggered = true; }
  } else {
    feedback.push("Keep the rhythm — arms and legs together!");
  }

  return {
    metrics: [
      { label: "Arm Raise", value: `${smooth}°`, status: smooth > 110 ? "good" : "ok" },
      { label: "Leg Spread", value: `${legSpread}%`, status: legSpread > 50 ? "good" : "ok" },
      { label: "Sync", value: smooth > 90 && legSpread > 40 ? "synced" : "off-sync", status: smooth > 90 && legSpread > 40 ? "good" : "warn" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

function analyzeLateralRaise(kp, state, angleWin) {
  const ls = getKp(kp, "left_shoulder", 5), rs = getKp(kp, "right_shoulder", 6);
  const le = getKp(kp, "left_elbow", 7), re = getKp(kp, "right_elbow", 8);
  const lw = getKp(kp, "left_wrist", 9), rw = getKp(kp, "right_wrist", 10);

  // Arm elevation angle relative to torso
  const lAngle = calcAngle({ x: ls?.x ?? 0, y: (ls?.y ?? 0) + 100 }, ls, lw);
  const rAngle = calcAngle({ x: rs?.x ?? 0, y: (rs?.y ?? 0) + 100 }, rs, rw);
  const armAngle = avgAngle(lAngle, rAngle);

  // Elbow bend (should be slight, ~160°)
  const lElbow = calcAngle(ls, le, lw);
  const rElbow = calcAngle(rs, re, rw);
  const elbowBend = avgAngle(lElbow, rElbow);

  if (armAngle == null) return { metrics: null, feedback: "Show shoulders and arms in frame.", repTriggered: false };

  const smooth = smoothAngle(angleWin, armAngle);

  let repTriggered = false;
  const feedback = [];

  if (smooth > 80) {
    feedback.push("Arms at shoulder level — perfect raise!");
    if (state.current === "down") state.current = "up";
  } else if (smooth < 20) {
    feedback.push("Lower arms back — control the descent.");
    if (state.current === "up") { state.current = "down"; repTriggered = true; }
  } else {
    feedback.push("Raise arms out to the sides — lead with elbows.");
  }

  if (elbowBend != null && elbowBend < 130) feedback.push("Keep arms almost straight — slight elbow bend only.");

  return {
    metrics: [
      { label: "Arm Elevation", value: `${smooth}°`, status: smooth > 70 ? "good" : "ok" },
      { label: "Elbow Bend", value: elbowBend ? `${Math.round(elbowBend)}°` : "--", status: elbowBend && elbowBend > 150 ? "good" : "ok" },
      { label: "Height", value: smooth > 80 ? "shoulder level" : smooth > 50 ? "mid" : "low", status: smooth > 70 ? "good" : "warn" },
    ],
    feedback: feedback.join(" "),
    repTriggered,
  };
}

const ANALYZERS = {
  squat: analyzeSquat,
  pushup: analyzePushUp,
  lunge: analyzeLunge,
  bicep_curl: analyzeBicepCurl,
  shoulder_press: analyzeShoulderPress,
  deadlift: analyzeDeadlift,
  jumping_jack: analyzeJumpingJack,
  side_lateral_raise: analyzeLateralRaise,
};

// State init per exercise (some need different initial state)
const initState = (id) => {
  if (id === "jumping_jack") return { current: "closed" };
  if (id === "bicep_curl") return { current: "up" };
  return { current: "up" };
};

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS DRAWING
// ─────────────────────────────────────────────────────────────────────────────
const SKELETON_PAIRS = [
  [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],
  [5, 11], [6, 12], [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
];

function drawPose(ctx, keypoints, color = "#22c55e") {
  if (!keypoints) return;

  // Draw skeleton
  SKELETON_PAIRS.forEach(([a, b]) => {
    const kpA = keypoints[a], kpB = keypoints[b];
    if (!kpA || !kpB) return;
    if ((kpA.score ?? 1) < 0.25 || (kpB.score ?? 1) < 0.25) return;
    ctx.beginPath();
    ctx.moveTo(kpA.x, kpA.y);
    ctx.lineTo(kpB.x, kpB.y);
    ctx.strokeStyle = `${color}88`;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });

  // Draw joints
  keypoints.forEach((kp) => {
    if (!kp || (kp.score ?? 1) < 0.25) return;
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#020617";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function PoseWorkout() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const repState = useRef({ current: "up" });
  const lastRepTime = useRef(0);
  const angleWindow = useRef([]);

  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [status, setStatus] = useState("Loading model…");
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState("Get into position…");
  const [metrics, setMetrics] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Reset when exercise changes
  const selectExercise = useCallback((ex) => {
    setSelectedExercise(ex);
    setReps(0);
    setFeedback("Get into position…");
    setMetrics(null);
    repState.current = initState(ex.id);
    angleWindow.current = [];
    lastRepTime.current = 0;
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);

        try { await tf.setBackend("webgl"); await tf.ready(); }
        catch { await tf.ready(); }

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER }
        );
        detectorRef.current = detector;
        setStatus("AI Trainer Active");
        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        setStatus("Camera/model error: " + (err.message || err));
      }
    };

    init();
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
      try { detectorRef.current?.dispose(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedExRef = useRef(selectedExercise);
  useEffect(() => { selectedExRef.current = selectedExercise; }, [selectedExercise]);

  const repsRef = useRef(0);
  const loop = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current) { rafRef.current = requestAnimationFrame(loop); return; }
    try {
      const poses = await detectorRef.current.estimatePoses(videoRef.current, { maxPoses: 1, flipHorizontal: true });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      if (poses?.length > 0) {
        const ex = selectedExRef.current;
        drawPose(ctx, poses[0].keypoints, ex.color);
        const analyze = ANALYZERS[ex.id];
        if (analyze) {
          const result = analyze(poses[0].keypoints, repState.current, angleWindow.current);
          if (result.metrics) setMetrics(result.metrics);
          setFeedback(result.feedback || "Keep going…");

          const now = Date.now();
          if (result.repTriggered && now - lastRepTime.current > 700) {
            lastRepTime.current = now;
            repsRef.current += 1;
            setReps(repsRef.current);
          }
        }
      } else {
        setFeedback("No person detected — step into frame.");
        setMetrics(null);
      }
    } catch (err) {
      console.error("pose error", err);
    }
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const statusColor = { good: "#22c55e", ok: "#f59e0b", warn: "#ef4444" };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* ── Exercise selector ── */}
      <div style={{ marginBottom: 18, overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 8, paddingBottom: 4, width: "max-content" }}>
          {EXERCISES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => selectExercise(ex)}
              style={{
                padding: "8px 14px",
                borderRadius: 12,
                border: `1.5px solid ${selectedExercise.id === ex.id ? ex.color : "rgba(148,163,184,0.3)"}`,
                background: selectedExercise.id === ex.id
                  ? `${ex.color}22`
                  : "rgba(15,23,42,0.6)",
                color: selectedExercise.id === ex.id ? ex.color : "#9ca3af",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: selectedExercise.id === ex.id ? 700 : 400,
                whiteSpace: "nowrap",
                transition: "all 0.18s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{ex.icon}</span>
              <span>{ex.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* Video + Canvas */}
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: `1.5px solid ${selectedExercise.color}44`, flexShrink: 0 }}>
          <video ref={videoRef} width={560} height={420} playsInline
            style={{ display: "block", transform: "scaleX(-1)" }} />
          <canvas ref={canvasRef} width={560} height={420}
            style={{ position: "absolute", left: 0, top: 0 }} />

          {/* Reps overlay */}
          <div style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(2,6,23,0.85)", borderRadius: 12,
            padding: "8px 14px", textAlign: "center",
            border: `1px solid ${selectedExercise.color}66`,
            minWidth: 72,
          }}>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>REPS</div>
            <div style={{ fontSize: 32, color: selectedExercise.color, fontWeight: 800 }}>{reps}</div>
          </div>

          {/* Status pill */}
          <div style={{
            position: "absolute", top: 12, left: 12,
            background: "rgba(2,6,23,0.8)", borderRadius: 999,
            padding: "4px 10px", fontSize: 11, color: "#9ca3af",
            border: "1px solid rgba(148,163,184,0.15)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: cameraReady ? "#22c55e" : "#9ca3af",
              display: "inline-block",
              boxShadow: cameraReady ? "0 0 6px #22c55e" : "none",
            }} />
            {status}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ flex: 1, minWidth: 260 }}>

          {/* Exercise info */}
          <div style={{
            background: "rgba(15,23,42,0.85)",
            borderRadius: 14,
            padding: "14px 16px",
            border: `1px solid ${selectedExercise.color}33`,
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              {selectedExercise.icon} {selectedExercise.name}
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>{selectedExercise.description}</div>
            <div style={{
              display: "inline-block", fontSize: 11, color: selectedExercise.color,
              background: `${selectedExercise.color}18`, padding: "2px 8px", borderRadius: 999,
              border: `1px solid ${selectedExercise.color}44`,
            }}>
              {selectedExercise.targetMuscles}
            </div>
          </div>

          {/* Live metrics */}
          <div style={{
            background: "rgba(15,23,42,0.85)",
            borderRadius: 14, padding: "14px 16px",
            border: "1px solid rgba(148,163,184,0.12)",
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Live Metrics
            </div>
            {metrics ? (
              metrics.map((m) => (
                <div key={m.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 0", borderBottom: "1px solid rgba(148,163,184,0.08)",
                }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{m.label}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: statusColor[m.status] || "#f9fafb",
                    background: `${statusColor[m.status] || "#f9fafb"}18`,
                    padding: "2px 8px", borderRadius: 6,
                  }}>
                    {m.value}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: "#6b7280" }}>Start moving to see metrics…</div>
            )}
          </div>

          {/* Tips */}
          <div style={{
            background: "rgba(15,23,42,0.85)", borderRadius: 14,
            padding: "12px 14px", border: "1px solid rgba(148,163,184,0.1)",
          }}>
            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Tips</div>
            <ul style={{ margin: 0, paddingLeft: 16, color: "#9ca3af", fontSize: 12, lineHeight: 1.7 }}>
              <li>Ensure good lighting on your body.</li>
              <li>Keep all joints visible in frame.</li>
              <li>Side view works best for squats & deadlifts.</li>
              <li>Front view works best for curls & raises.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Feedback bar */}
      <div style={{
        marginTop: 16,
        padding: "14px 20px",
        borderRadius: 14,
        background: `linear-gradient(90deg, ${selectedExercise.color}15, rgba(15,23,42,0.9))`,
        border: `1px solid ${selectedExercise.color}44`,
        fontSize: 16,
        fontWeight: 700,
        color: "#f9fafb",
        lineHeight: 1.4,
        minHeight: 52,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>{selectedExercise.icon}</span>
        <span>{feedback}</span>
      </div>
    </div>
  );
}
