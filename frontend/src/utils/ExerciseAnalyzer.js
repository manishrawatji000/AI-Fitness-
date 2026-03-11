// frontend/src/utils/ExerciseAnalyzer.js
class ExerciseAnalyzer {
  constructor(exerciseType) {
    this.exerciseType = exerciseType;
    this.repState = 'up';
    this.lastRepTime = 0;
    this.angleWindow = [];
    this.WINDOW_SIZE = 5;
    this.COOLDOWN_MS = 500;
    this.formScoreHistory = [];
  }

  getKeypoint(keypoints, name) {
    if (!keypoints || keypoints.length === 0) return null;
    if (keypoints[0] && keypoints[0].name) {
      return keypoints.find((k) => k.name === name) || null;
    }
    return null;
  }

  calculateAngle(A, B, C) {
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
  }

  smoothAngle(angle) {
    if (angle === null) return null;
    this.angleWindow.push(angle);
    if (this.angleWindow.length > this.WINDOW_SIZE) {
      this.angleWindow.shift();
    }
    return Math.round(
      this.angleWindow.reduce((a, b) => a + b, 0) / this.angleWindow.length
    );
  }

  calculateFormScore(metrics) {
    let score = 100;
    Object.entries(metrics).forEach(([key, value]) => {
      if (value.penalty) {
        score -= value.penalty;
      }
    });
    return Math.max(0, Math.min(100, score));
  }

  analyze(keypoints) {
    switch (this.exerciseType) {
      case 'squats':
        return this.analyzeSquats(keypoints);
      case 'pushups':
        return this.analyzePushups(keypoints);
      case 'bicep-curls':
        return this.analyzeBicepCurls(keypoints);
      case 'shoulder-press':
        return this.analyzeShoulderPress(keypoints);
      case 'lunges':
        return this.analyzeLunges(keypoints);
      case 'plank':
        return this.analyzePlank(keypoints);
      default:
        return { error: 'Unknown exercise type' };
    }
  }

  analyzeSquats(keypoints) {
    const leftHip = this.getKeypoint(keypoints, 'left_hip');
    const leftKnee = this.getKeypoint(keypoints, 'left_knee');
    const leftAnkle = this.getKeypoint(keypoints, 'left_ankle');
    const rightHip = this.getKeypoint(keypoints, 'right_hip');
    const rightKnee = this.getKeypoint(keypoints, 'right_knee');
    const rightAnkle = this.getKeypoint(keypoints, 'right_ankle');

    if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
      return {
        error: 'Cannot detect hips, knees, and ankles. Adjust camera position.',
        formScore: 0,
        angle: '--',
        phase: 'error'
      };
    }

    const leftAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
    const avgAngle = (leftAngle + rightAngle) / 2;
    const smoothedAngle = this.smoothAngle(avgAngle);

    // Thresholds
    const BOTTOM_ANGLE = 90;
    const TOP_ANGLE = 160;
    const MIN_SAFE_ANGLE = 50;

    let feedback = '';
    let formScore = 100;
    let phase = 'middle';

    // Form analysis
    if (smoothedAngle < MIN_SAFE_ANGLE) {
      feedback = '⚠️ Too deep! Risk of knee injury. Come up a bit.';
      formScore = 40;
      phase = 'danger';
    } else if (smoothedAngle < BOTTOM_ANGLE) {
      feedback = '✅ Perfect depth! Now push through your heels to stand.';
      formScore = 100;
      phase = 'down';
    } else if (smoothedAngle > TOP_ANGLE) {
      feedback = '✅ Good! Standing tall. Ready for next rep.';
      formScore = 95;
      phase = 'up';
    } else if (smoothedAngle > 140) {
      feedback = '⬆️ Almost there! Fully extend to complete the rep.';
      formScore = 85;
      phase = 'rising';
    } else {
      feedback = '⬇️ Keep going down. Chest up, core tight.';
      formScore = 80;
      phase = 'descending';
    }

    // Rep counting logic
    let repCompleted = false;
    const now = Date.now();

    if (smoothedAngle <= BOTTOM_ANGLE && this.repState === 'up') {
      this.repState = 'down';
    }

    if (smoothedAngle >= TOP_ANGLE && 
        this.repState === 'down' && 
        now - this.lastRepTime > this.COOLDOWN_MS) {
      this.lastRepTime = now;
      this.repState = 'up';
      repCompleted = true;
      feedback = '🎉 Great rep! Keep the form consistent.';
    }

    return {
      feedback,
      formScore,
      angle: smoothedAngle,
      phase,
      repCompleted
    };
  }

  analyzePushups(keypoints) {
    const leftShoulder = this.getKeypoint(keypoints, 'left_shoulder');
    const leftElbow = this.getKeypoint(keypoints, 'left_elbow');
    const leftWrist = this.getKeypoint(keypoints, 'left_wrist');
    const rightShoulder = this.getKeypoint(keypoints, 'right_shoulder');
    const rightElbow = this.getKeypoint(keypoints, 'right_elbow');
    const rightWrist = this.getKeypoint(keypoints, 'right_wrist');

    if (!leftShoulder || !leftElbow || !leftWrist || !rightShoulder || !rightElbow || !rightWrist) {
      return {
        error: 'Position yourself so arms and shoulders are visible.',
        formScore: 0,
        angle: '--',
        phase: 'error'
      };
    }

    const leftAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
    const avgAngle = (leftAngle + rightAngle) / 2;
    const smoothedAngle = this.smoothAngle(avgAngle);

    const BOTTOM_ANGLE = 90;
    const TOP_ANGLE = 160;

    let feedback = '';
    let formScore = 100;
    let phase = 'middle';
    let repCompleted = false;
    const now = Date.now();

    if (smoothedAngle < 70) {
      feedback = '⚠️ Going too low! Keep chest above ground.';
      formScore = 60;
      phase = 'danger';
    } else if (smoothedAngle < BOTTOM_ANGLE) {
      feedback = '✅ Perfect form! Lower chest, elbows at 45°.';
      formScore = 100;
      phase = 'down';
    } else if (smoothedAngle > TOP_ANGLE) {
      feedback = '✅ Full extension! Arms locked, ready for next rep.';
      formScore = 95;
      phase = 'up';
    } else if (smoothedAngle > 140) {
      feedback = '⬆️ Almost there! Push to full extension.';
      formScore = 85;
      phase = 'rising';
    } else {
      feedback = '⬇️ Lower down. Keep body straight like a plank.';
      formScore = 80;
      phase = 'descending';
    }

    if (smoothedAngle <= BOTTOM_ANGLE && this.repState === 'up') {
      this.repState = 'down';
    }

    if (smoothedAngle >= TOP_ANGLE && 
        this.repState === 'down' && 
        now - this.lastRepTime > this.COOLDOWN_MS) {
      this.lastRepTime = now;
      this.repState = 'up';
      repCompleted = true;
      feedback = '🎉 Excellent push-up! Maintain that form.';
    }

    return { feedback, formScore, angle: smoothedAngle, phase, repCompleted };
  }

  analyzeBicepCurls(keypoints) {
    const leftShoulder = this.getKeypoint(keypoints, 'left_shoulder');
    const leftElbow = this.getKeypoint(keypoints, 'left_elbow');
    const leftWrist = this.getKeypoint(keypoints, 'left_wrist');

    if (!leftShoulder || !leftElbow || !leftWrist) {
      return {
        error: 'Show your arm clearly. Shoulder, elbow, and wrist needed.',
        formScore: 0,
        angle: '--',
        phase: 'error'
      };
    }

    const angle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
    const smoothedAngle = this.smoothAngle(angle);

    const TOP_ANGLE = 160;  // Arm extended
    const BOTTOM_ANGLE = 50;  // Fully curled

    let feedback = '';
    let formScore = 100;
    let phase = 'middle';
    let repCompleted = false;
    const now = Date.now();

    if (smoothedAngle < BOTTOM_ANGLE) {
      feedback = '✅ Full contraction! Squeeze that bicep!';
      formScore = 100;
      phase = 'contracted';
    } else if (smoothedAngle < 90) {
      feedback = '⬆️ Keep curling! Bring hand toward shoulder.';
      formScore = 85;
      phase = 'curling';
    } else if (smoothedAngle > TOP_ANGLE) {
      feedback = '✅ Arm fully extended. Ready for next curl.';
      formScore = 95;
      phase = 'extended';
    } else {
      feedback = '⬇️ Lower slowly. Control the weight.';
      formScore = 80;
      phase = 'lowering';
    }

    if (smoothedAngle <= BOTTOM_ANGLE && this.repState === 'down') {
      this.repState = 'up';
    }

    if (smoothedAngle >= TOP_ANGLE && 
        this.repState === 'up' && 
        now - this.lastRepTime > this.COOLDOWN_MS) {
      this.lastRepTime = now;
      this.repState = 'down';
      repCompleted = true;
      feedback = '🎉 Perfect curl! Keep elbows stationary.';
    }

    return { feedback, formScore, angle: smoothedAngle, phase, repCompleted };
  }

  analyzeShoulderPress(keypoints) {
    const leftShoulder = this.getKeypoint(keypoints, 'left_shoulder');
    const leftElbow = this.getKeypoint(keypoints, 'left_elbow');
    const leftWrist = this.getKeypoint(keypoints, 'left_wrist');

    if (!leftShoulder || !leftElbow || !leftWrist) {
      return {
        error: 'Position camera to see shoulder, elbow, and wrist.',
        formScore: 0,
        angle: '--',
        phase: 'error'
      };
    }

    const angle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
    const smoothedAngle = this.smoothAngle(angle);

    const BOTTOM_ANGLE = 90;
    const TOP_ANGLE = 165;

    let feedback = '';
    let formScore = 100;
    let phase = 'middle';
    let repCompleted = false;
    const now = Date.now();

    if (smoothedAngle < BOTTOM_ANGLE) {
      feedback = '✅ Good starting position. Now press overhead!';
      formScore = 95;
      phase = 'bottom';
    } else if (smoothedAngle > TOP_ANGLE) {
      feedback = '✅ Full lockout! Arms fully extended overhead.';
      formScore = 100;
      phase = 'top';
    } else if (smoothedAngle > 140) {
      feedback = '⬆️ Almost there! Lock out at the top.';
      formScore = 85;
      phase = 'pressing';
    } else {
      feedback = '⬇️ Lower with control. Keep core tight.';
      formScore = 80;
      phase = 'lowering';
    }

    if (smoothedAngle <= BOTTOM_ANGLE && this.repState === 'up') {
      this.repState = 'down';
    }

    if (smoothedAngle >= TOP_ANGLE && 
        this.repState === 'down' && 
        now - this.lastRepTime > this.COOLDOWN_MS) {
      this.lastRepTime = now;
      this.repState = 'up';
      repCompleted = true;
      feedback = '🎉 Excellent press! Maintain that control.';
    }

    return { feedback, formScore, angle: smoothedAngle, phase, repCompleted };
  }

  analyzeLunges(keypoints) {
    const leftHip = this.getKeypoint(keypoints, 'left_hip');
    const leftKnee = this.getKeypoint(keypoints, 'left_knee');
    const leftAnkle = this.getKeypoint(keypoints, 'left_ankle');

    if (!leftHip || !leftKnee || !leftAnkle) {
      return {
        error: 'Show your full leg. Hip, knee, and ankle needed.',
        formScore: 0,
        angle: '--',
        phase: 'error'
      };
    }

    const angle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
    const smoothedAngle = this.smoothAngle(angle);

    const BOTTOM_ANGLE = 90;
    const TOP_ANGLE = 165;

    let feedback = '';
    let formScore = 100;
    let phase = 'middle';
    let repCompleted = false;
    const now = Date.now();

    if (smoothedAngle < BOTTOM_ANGLE) {
      feedback = '✅ Perfect lunge depth! Back knee near ground.';
      formScore = 100;
      phase = 'bottom';
    } else if (smoothedAngle > TOP_ANGLE) {
      feedback = '✅ Standing tall. Ready for next lunge.';
      formScore = 95;
      phase = 'standing';
    } else if (smoothedAngle < 120) {
      feedback = '⬇️ Keep lowering. Front knee over ankle.';
      formScore = 85;
      phase = 'descending';
    } else {
      feedback = '⬆️ Push through front heel to stand.';
      formScore = 80;
      phase = 'rising';
    }

    if (smoothedAngle <= BOTTOM_ANGLE && this.repState === 'up') {
      this.repState = 'down';
    }

    if (smoothedAngle >= TOP_ANGLE && 
        this.repState === 'down' && 
        now - this.lastRepTime > this.COOLDOWN_MS) {
      this.lastRepTime = now;
      this.repState = 'up';
      repCompleted = true;
      feedback = '🎉 Great lunge! Switch legs or continue.';
    }

    return { feedback, formScore, angle: smoothedAngle, phase, repCompleted };
  }

  analyzePlank(keypoints) {
    const leftShoulder = this.getKeypoint(keypoints, 'left_shoulder');
    const leftHip = this.getKeypoint(keypoints, 'left_hip');
    const leftKnee = this.getKeypoint(keypoints, 'left_knee');

    if (!leftShoulder || !leftHip || !leftKnee) {
      return {
        error: 'Show your side profile. Shoulder, hip, knee needed.',
        formScore: 0,
        angle: '--',
        phase: 'error'
      };
    }

    const angle = this.calculateAngle(leftShoulder, leftHip, leftKnee);
    const smoothedAngle = this.smoothAngle(angle);

    let feedback = '';
    let formScore = 100;
    let phase = 'holding';

    if (smoothedAngle < 160) {
      feedback = '⚠️ Hips are sagging! Engage your core and lift hips.';
      formScore = 50;
      phase = 'sagging';
    } else if (smoothedAngle > 185) {
      feedback = '⚠️ Hips too high! Lower slightly to form straight line.';
      formScore = 60;
      phase = 'piking';
    } else {
      feedback = '✅ Perfect plank! Body forms a straight line. Hold it!';
      formScore = 100;
      phase = 'perfect';
    }

    return { 
      feedback, 
      formScore, 
      angle: smoothedAngle, 
      phase, 
      repCompleted: false  // Plank is isometric, no reps
    };
  }
}

export default ExerciseAnalyzer;