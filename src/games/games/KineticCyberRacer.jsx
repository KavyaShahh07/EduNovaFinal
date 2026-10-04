import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Flame,
  Gauge,
  Trophy,
  RotateCcw,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

// Dynamic Physics / Speed Gate Challenges
const RACING_CHALLENGES = [
  {
    q: 'Kinetic Energy Formula: If speed doubles, kinetic energy Ek increases by:',
    options: ['4x (Ek ∝ v²)', '2x (Ek ∝ v)', '8x (Ek ∝ v³)', 'Unchanged'],
    correct: 0,
    explanation: 'Kinetic Energy Ek = ½mv². Because velocity is squared, doubling speed quadruples kinetic energy!'
  },
  {
    q: 'Momentum p = m·v. A 1,200 kg car at 20 m/s (72 km/h) has momentum:',
    options: ['24,000 kg·m/s', '12,000 kg·m/s', '6,000 kg·m/s', '48,000 kg·m/s'],
    correct: 0,
    explanation: 'Momentum p = 1,200 kg × 20 m/s = 24,000 kg·m/s.'
  },
  {
    q: 'Centripetal Force on a curved turn is Fc = (m·v²)/r. To reduce skid risk:',
    options: ['Reduce speed (v)', 'Sharp tighter turn (lower r)', 'Heavier car', 'Disconnect tires'],
    correct: 0,
    explanation: 'Reducing velocity v exponentially lowers required centripetal force since Fc depends on v²!'
  },
  {
    q: 'Braking Distance d = v² / (2μg). On wet asphalt with half friction μ:',
    options: ['Braking distance doubles (2x)', 'Braking distance halves (½x)', 'Stays identical', 'Increases 4x'],
    correct: 0,
    explanation: 'Braking distance is inversely proportional to tire-road friction coefficient μ. Half friction means 2x distance!'
  },
  {
    q: 'Acceleration formula a = Δv / Δt. A car accelerating from 0 to 100 km/h (~28 m/s) in 4s has a =',
    options: ['7.0 m/s²', '3.5 m/s²', '14.0 m/s²', '28.0 m/s²'],
    correct: 0,
    explanation: 'Acceleration a = 28 m/s ÷ 4 s = 7.0 m/s² (~0.71 G-force).'
  },
  {
    q: 'Aerodynamic Drag Force Fd = ½·ρ·v²·Cd·A. At 200 km/h vs 100 km/h, air resistance is:',
    options: ['4 times greater', '2 times greater', '8 times greater', 'Same'],
    correct: 0,
    explanation: 'Aerodynamic drag scales with the square of velocity (v²). Doubling speed quadruples drag!'
  }
];

export const KineticCyberRacer = ({
  isPaused = false,
  isMuted = false,
  isLight = false,
  onFinish = () => {},
  onAttempt = () => {},
  onChallengeChange = () => {}
}) => {
  const canvasRef = useRef(null);

  // Gameplay State
  const [speed, setSpeed] = useState(0); // km/h
  const [rpm, setRpm] = useState(1000);
  const [gear, setGear] = useState(1);
  const [nitro, setNitro] = useState(100);
  const [isBoosting, setIsBoosting] = useState(false);
  const [score, setScore] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(90); // 90 second grand prix sprint
  const [gameOver, setGameOver] = useState(false);
  const [activeGate, setActiveGate] = useState(null); // Current Speed Gate Question
  const [gateFeedback, setGateFeedback] = useState(null); // 'SUPER NITRO!' | 'SPEED PENALTY'

  // Ref tracking mutable physics across requestAnimationFrame
  const stateRef = useRef({
    playerX: 0, // -1 (left curb) to +1 (right curb)
    targetX: 0,
    speed: 0, // 0 to 320 km/h
    maxSpeed: 300,
    rpm: 1000,
    gear: 1,
    nitro: 100,
    isBoosting: false,
    score: 0,
    combo: 0,
    distanceMeters: 0,
    roadCurve: 0,
    targetCurve: 0,
    curveTimer: 0,
    roadPosition: 0,
    traffic: [],
    speedGateZ: 800, // Distance to next speed gate
    currentChallengeIdx: 0,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      nitro: false
    },
    shakeTime: 0,
    particles: [],
    lastRevSoundTime: 0,
    mistakes: [],
    nearMissStreak: 0
  });

  // Setup Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = stateRef.current.keys;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        keys.left = true;
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        keys.right = true;
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        keys.up = true;
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        keys.down = true;
      } else if (e.key === ' ' || e.key.toLowerCase() === 'shift') {
        keys.nitro = true;
      }
    };

    const handleKeyUp = (e) => {
      const keys = stateRef.current.keys;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        keys.right = false;
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        keys.up = false;
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        keys.down = false;
      } else if (e.key === ' ' || e.key.toLowerCase() === 'shift') {
        keys.nitro = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize Traffic and First Challenge
  useEffect(() => {
    // Generate initial traffic
    const initialTraffic = [];
    for (let i = 0; i < 6; i++) {
      initialTraffic.push({
        lane: Math.floor(Math.random() * 3) - 1, // -1, 0, 1
        z: 300 + i * 260 + Math.random() * 80,
        speed: 110 + Math.random() * 60,
        color: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][i % 6],
        model: ['sport', 'hyper', 'sedan', 'truck'][Math.floor(Math.random() * 4)]
      });
    }
    stateRef.current.traffic = initialTraffic;

    const initialChallenge = RACING_CHALLENGES[0];
    setActiveGate(initialChallenge);
    onChallengeChange({
      question: `Velocity Apex: ${initialChallenge.q}`,
      context: 'Steer into the correct speed portal lane to trigger instant Super Nitro!'
    });
  }, []);

  // Game Countdown Timer
  useEffect(() => {
    if (isPaused || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishRace();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, gameOver]);

  const finishRace = () => {
    setGameOver(true);
    soundManager.playVictory();
    const finalDist = (stateRef.current.distanceMeters / 1000).toFixed(2);
    const accuracy = Math.max(70, Math.min(100, 100 - stateRef.current.mistakes.length * 8));

    onFinish({
      score: stateRef.current.score,
      accuracy,
      mistakes: stateRef.current.mistakes,
      maxCombo: stateRef.current.combo,
      stats: {
        distanceKm: finalDist,
        topSpeed: Math.round(stateRef.current.maxSpeed),
        superNitrosEngaged: Math.floor(stateRef.current.score / 350)
      }
    });
  };

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // High DPI Support
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!isPaused && !gameOver) {
        updatePhysics(dt, currentTime);
      }
      renderScene(ctx, canvas);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isPaused, gameOver]);

  // Update Realistic Physics & Progression
  const updatePhysics = (dt, currentTime) => {
    const s = stateRef.current;
    const keys = s.keys;

    // Acceleration & Braking
    const accelRate = 85; // km/h per second
    const brakeRate = 180;
    const friction = 28;

    let targetMax = 270;
    const wantsBoost = keys.nitro && s.nitro > 5;

    if (wantsBoost) {
      targetMax = 330;
      s.isBoosting = true;
      s.nitro = Math.max(0, s.nitro - dt * 25);
      if (Math.random() < 0.3) {
        soundManager.playNitro();
      }
    } else {
      s.isBoosting = false;
      // Passive nitro regeneration
      s.nitro = Math.min(100, s.nitro + dt * 4);
    }

    if (keys.up) {
      s.speed = Math.min(targetMax, s.speed + accelRate * dt * (s.isBoosting ? 1.6 : 1.0));
    } else if (keys.down) {
      s.speed = Math.max(0, s.speed - brakeRate * dt);
      if (s.speed > 80 && Math.random() < 0.2) {
        soundManager.playSkid();
      }
    } else {
      // Natural rolling resistance
      s.speed = Math.max(0, s.speed - friction * dt);
    }

    // Engine Audio & Rev Counter
    if (currentTime - s.lastRevSoundTime > 200 && s.speed > 10) {
      const ratio = s.speed / 320;
      soundManager.playEngineRev(ratio);
      s.lastRevSoundTime = currentTime;
    }

    // Gear & RPM Calculations
    const gearRatios = [0, 50, 110, 170, 230, 280, 340];
    let curGear = 1;
    for (let g = 1; g < gearRatios.length; g++) {
      if (s.speed >= gearRatios[g - 1]) curGear = g;
    }
    s.gear = curGear;
    const gearBaseSpeed = gearRatios[curGear - 1];
    const gearTopSpeed = gearRatios[curGear] || 350;
    const gearProgress = (s.speed - gearBaseSpeed) / (gearTopSpeed - gearBaseSpeed);
    s.rpm = Math.min(8500, Math.floor(1200 + gearProgress * 6500));

    // Steering Physics & Centrifugal Drift
    const steerSpeed = 1.6;
    if (keys.left) {
      s.playerX = Math.max(-1.15, s.playerX - steerSpeed * dt * (s.speed / 160 + 0.4));
      if (Math.random() < 0.15 && s.speed > 150) soundManager.playSkid();
    }
    if (keys.right) {
      s.playerX = Math.min(1.15, s.playerX + steerSpeed * dt * (s.speed / 160 + 0.4));
      if (Math.random() < 0.15 && s.speed > 150) soundManager.playSkid();
    }

    // Off-road penalty on grass/shoulder
    if (Math.abs(s.playerX) > 0.95 && s.speed > 80) {
      s.speed = Math.max(80, s.speed - 90 * dt);
      s.shakeTime = 0.1;
    }

    // Road Curvature Physics
    s.curveTimer += dt;
    if (s.curveTimer > 4.5) {
      s.curveTimer = 0;
      s.targetCurve = (Math.random() * 2 - 1) * 0.85; // Sharp or gentle turns
    }
    s.roadCurve += (s.targetCurve - s.roadCurve) * dt * 0.8;

    // Centrifugal drift pulling the car outward
    s.playerX -= s.roadCurve * (s.speed / 280) * dt * 0.4;

    // Distance & Progression
    const speedMps = (s.speed * 1000) / 3600;
    s.distanceMeters += speedMps * dt;
    s.roadPosition += speedMps * dt;
    s.score += Math.floor((s.speed * dt * 0.8) * (1 + s.combo * 0.1));

    // Speed Gate Progression
    s.speedGateZ -= speedMps * dt;
    if (s.speedGateZ <= 20) {
      evaluateSpeedGate();
      s.speedGateZ = 1200; // Next gate 1.2km down the highway
    }

    // Traffic Cars Simulation
    s.traffic.forEach((car) => {
      const carSpeedMps = (car.speed * 1000) / 3600;
      car.z -= (speedMps - carSpeedMps) * dt;

      // Respawn traffic ahead if passed or fallen far behind
      if (car.z < -40) {
        car.z = 900 + Math.random() * 400;
        car.lane = Math.floor(Math.random() * 3) - 1;
        car.speed = 100 + Math.random() * 70;
      } else if (car.z > 1400) {
        car.z = 200 + Math.random() * 300;
      }

      // Near-Miss / Slipstream detection (within z: 5 to 30, close X)
      const carX = car.lane * 0.65;
      const distX = Math.abs(s.playerX - carX);
      if (car.z > 5 && car.z < 28 && distX < 0.38) {
        // Close pass bonus!
        s.score += 25;
        s.nearMissStreak++;
        if (s.nearMissStreak % 3 === 0) {
          soundManager.playFlyby();
        }
      }

      // Crash Collision Detection (z: -5 to 15, direct overlap)
      if (car.z > -5 && car.z < 18 && distX < 0.22) {
        handleCarCrash(car);
      }
    });

    // Particle Exhaust & Drift Sparks
    if (s.speed > 30) {
      s.particles.push({
        x: s.playerX,
        y: 0,
        z: 0,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.1,
        life: 1.0,
        color: s.isBoosting ? '#38bdf8' : '#fb923c'
      });
    }

    // Update particles
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.life -= dt * 3.5;
      p.y -= dt * 0.5;
      if (p.life <= 0) s.particles.splice(i, 1);
    }

    // Update React HUD state periodically
    setSpeed(Math.round(s.speed));
    setRpm(s.rpm);
    setGear(s.gear);
    setNitro(Math.round(s.nitro));
    setIsBoosting(s.isBoosting);
    setScore(s.score);
    setDistanceKm((s.distanceMeters / 1000).toFixed(1));
    setCombo(s.combo);
  };

  // Evaluate Lane at Speed Gate Checkpoint
  const evaluateSpeedGate = () => {
    const s = stateRef.current;
    const challenge = RACING_CHALLENGES[s.currentChallengeIdx % RACING_CHALLENGES.length];

    // Determine which lane the player is in:
    // Left lane: X < -0.35 (Index 0)
    // Center lane: -0.35 <= X <= 0.35 (Index 1)
    // Right lane: X > 0.35 (Index 2)
    let chosenLane = 1;
    if (s.playerX < -0.35) chosenLane = 0;
    else if (s.playerX > 0.35) chosenLane = 2;

    const isCorrect = chosenLane === challenge.correct;

    if (isCorrect) {
      soundManager.playCorrect();
      soundManager.playNitro();
      s.speed = Math.min(340, s.speed + 80); // Super nitro burst!
      s.nitro = 100; // Refill nitro tank
      s.score += 500;
      s.combo += 1;
      s.shakeTime = 0.3;
      setGateFeedback({ type: 'CORRECT', text: '⚡ SPEED GATE CLEARED! SUPER NITRO +80 KM/H!' });
      onAttempt(null);
    } else {
      soundManager.playWrong();
      s.speed = Math.max(60, s.speed * 0.65); // Speed penalty
      s.combo = 0;
      s.mistakes.push({
        question: challenge.q,
        chosen: challenge.options[chosenLane] || 'Out of bounds',
        correct: challenge.options[challenge.correct],
        explanation: challenge.explanation
      });
      setGateFeedback({ type: 'WRONG', text: '⚠️ WRONG SPEED GATE! ENGINE SPEED DROP!' });
      onAttempt({
        question: challenge.q,
        userAnswer: challenge.options[chosenLane] || 'Wrong Lane',
        correctAnswer: challenge.options[challenge.correct]
      });
    }

    setTimeout(() => setGateFeedback(null), 3500);

    // Advance to next challenge
    s.currentChallengeIdx++;
    const nextChallenge = RACING_CHALLENGES[s.currentChallengeIdx % RACING_CHALLENGES.length];
    setActiveGate(nextChallenge);
    onChallengeChange({
      question: `Velocity Apex: ${nextChallenge.q}`,
      context: 'Align car into the matching lane portal ahead to unlock Super Nitro!'
    });
  };

  const handleCarCrash = (car) => {
    const s = stateRef.current;
    soundManager.playExplosion();
    s.speed = Math.max(30, s.speed * 0.4);
    s.shakeTime = 0.45;
    car.z += 80; // Push car forward
    s.combo = 0;
    setLives(prev => {
      const next = prev - 1;
      if (next <= 0) {
        finishRace();
      }
      return next;
    });
  };

  // ================= 3D REALISTIC CANVAS RENDERING =================
  const renderScene = (ctx, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const s = stateRef.current;

    ctx.clearRect(0, 0, w, h);

    // Camera Shake
    ctx.save();
    if (s.shakeTime > 0) {
      s.shakeTime -= 0.016;
      const shakeMag = s.isBoosting ? 6 : 4;
      ctx.translate((Math.random() - 0.5) * shakeMag, (Math.random() - 0.5) * shakeMag);
    }

    // 1. SKY & HORIZON (Realistic Dusk / Sunset Twilight Gradient)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    skyGradient.addColorStop(0, '#090d16');
    skyGradient.addColorStop(0.4, '#1e1b4b');
    skyGradient.addColorStop(0.75, '#4c1d95');
    skyGradient.addColorStop(0.92, '#f43f5e');
    skyGradient.addColorStop(1, '#fbbf24');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, w, h * 0.55);

    // Glowing Distant Sun on Horizon
    const sunY = h * 0.52;
    const sunX = w * 0.5 + s.roadCurve * 120;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 140);
    sunGlow.addColorStop(0, 'rgba(255, 237, 213, 0.95)');
    sunGlow.addColorStop(0.3, 'rgba(251, 146, 60, 0.6)');
    sunGlow.addColorStop(0.7, 'rgba(244, 63, 94, 0.25)');
    sunGlow.addColorStop(1, 'rgba(76, 29, 149, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
    ctx.fill();

    // Distant Mountain Terrain Parallax
    ctx.fillStyle = '#0f0e1c';
    ctx.beginPath();
    ctx.moveTo(0, sunY);
    for (let x = 0; x <= w; x += 30) {
      const mountainH = Math.sin(x * 0.008 + s.roadPosition * 0.0002) * 35 +
                        Math.cos(x * 0.018) * 20 + 40;
      ctx.lineTo(x, sunY - mountainH);
    }
    ctx.lineTo(w, sunY);
    ctx.closePath();
    ctx.fill();

    // 2. GROUND & TERRAIN (Dark desert asphalt shoulders)
    const groundGradient = ctx.createLinearGradient(0, sunY, 0, h);
    groundGradient.addColorStop(0, '#0a0a14');
    groundGradient.addColorStop(1, '#05070d');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, sunY, w, h - sunY);

    // 3. PERSPECTIVE ROAD SEGMENTS
    const horizonY = sunY;
    const roadBaseW = w * 0.72;
    const roadTopW = w * 0.04;
    const segmentCount = 65;

    for (let i = segmentCount; i >= 1; i--) {
      const z1 = i * 16;
      const z2 = (i - 1) * 16;

      const p1 = project3D(z1, horizonY, h, roadBaseW, roadTopW, w, s.roadCurve, s.playerX);
      const p2 = project3D(z2, horizonY, h, roadBaseW, roadTopW, w, s.roadCurve, s.playerX);

      // Alternating road & rumble curb texture
      const isAlt = Math.floor((s.roadPosition + z1) / 32) % 2 === 0;

      // Grass / Dirt shoulder
      ctx.fillStyle = isAlt ? '#0a0d16' : '#070910';
      ctx.fillRect(0, p1.y, w, p2.y - p1.y + 1);

      // Red / White Rumble Strip Curbs
      const curbColor = isAlt ? '#ef4444' : '#ffffff';
      ctx.fillStyle = curbColor;
      ctx.beginPath();
      ctx.moveTo(p1.x - p1.w * 1.12, p1.y);
      ctx.lineTo(p1.x - p1.w, p1.y);
      ctx.lineTo(p2.x - p2.w, p2.y);
      ctx.lineTo(p2.x - p2.w * 1.12, p2.y);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(p1.x + p1.w, p1.y);
      ctx.lineTo(p1.x + p1.w * 1.12, p1.y);
      ctx.lineTo(p2.x + p2.w * 1.12, p2.y);
      ctx.lineTo(p2.x + p2.w, p2.y);
      ctx.fill();

      // Asphalt Road Surface
      ctx.fillStyle = isAlt ? '#1a1f2c' : '#141824';
      ctx.beginPath();
      ctx.moveTo(p1.x - p1.w, p1.y);
      ctx.lineTo(p1.x + p1.w, p1.y);
      ctx.lineTo(p2.x + p2.w, p2.y);
      ctx.lineTo(p2.x - p2.w, p2.y);
      ctx.fill();

      // Dashed White Lane Divider Lines (3 Lanes)
      if (isAlt) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        // Left divider
        const div1_x1 = p1.x - p1.w * 0.33;
        const div1_x2 = p2.x - p2.w * 0.33;
        const divW = Math.max(1.5, p1.w * 0.015);
        ctx.fillRect(div1_x1 - divW * 0.5, p1.y, divW, p2.y - p1.y + 1);

        // Right divider
        const div2_x1 = p1.x + p1.w * 0.33;
        const div2_x2 = p2.x + p2.w * 0.33;
        ctx.fillRect(div2_x1 - divW * 0.5, p1.y, divW, p2.y - p1.y + 1);
      }
    }

    // 4. SPEED GATE CHECKPOINT ARCHWAY
    if (s.speedGateZ > 10 && s.speedGateZ < 1000) {
      renderSpeedGate(ctx, s.speedGateZ, horizonY, h, roadBaseW, roadTopW, w, s);
    }

    // 5. TRAFFIC CARS
    // Sort traffic by Z descending (farthest first)
    const sortedTraffic = [...s.traffic].sort((a, b) => b.z - a.z);
    sortedTraffic.forEach(car => {
      if (car.z > 5 && car.z < 950) {
        renderTrafficCar(ctx, car, horizonY, h, roadBaseW, roadTopW, w, s);
      }
    });

    // 6. SPEED LINES & WARP TRAILS (High speed visual effect)
    if (s.speed > 160) {
      renderSpeedLines(ctx, w, h, s.speed, s.isBoosting);
    }

    // 7. EXHAUST PARTICLES
    s.particles.forEach(p => {
      const px = w * 0.5 + p.x * (roadBaseW * 0.45) + p.vx * 30;
      const py = h * 0.88 + p.y * 30;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1, p.life * 5), 0, Math.PI * 2);
      ctx.fill();
    });

    // 8. PLAYER SUPERCAR (High Fidelity GT Vector Model)
    renderPlayerCar(ctx, w, h, s);

    ctx.restore();
  };

  // Helper 3D Projection Math
  const project3D = (z, horizonY, screenH, roadBaseW, roadTopW, screenW, curve, playerX) => {
    const scale = 1 / Math.max(1, z * 0.0035 + 1);
    const y = horizonY + (screenH - horizonY) * (1 - scale * 0.96);
    const w = roadTopW + (roadBaseW - roadTopW) * (1 - scale * 0.94);
    const curveOffset = Math.pow(1 - scale, 1.8) * curve * 280;
    const playerOffset = (playerX * w * 0.5) * (1 - scale);
    const x = screenW * 0.5 + curveOffset - playerOffset;

    return { x, y, w, scale };
  };

  // Render Speed Gate Archway with 3 Lane Challenge Options
  const renderSpeedGate = (ctx, gateZ, horizonY, h, roadBaseW, roadTopW, w, s) => {
    const p = project3D(gateZ, horizonY, h, roadBaseW, roadTopW, w, s.roadCurve, s.playerX);
    const archH = p.w * 0.65;
    const archY = p.y - archH;

    // Glowing Holographic Pillars
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = Math.max(2, p.w * 0.025);
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 15;

    // Left Pillar
    ctx.beginPath();
    ctx.moveTo(p.x - p.w * 1.1, p.y);
    ctx.lineTo(p.x - p.w * 1.1, archY);
    ctx.stroke();

    // Right Pillar
    ctx.beginPath();
    ctx.moveTo(p.x + p.w * 1.1, p.y);
    ctx.lineTo(p.x + p.w * 1.1, archY);
    ctx.stroke();

    // Top Beam
    ctx.beginPath();
    ctx.moveTo(p.x - p.w * 1.15, archY);
    ctx.lineTo(p.x + p.w * 1.15, archY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Challenge Signs Above Each Lane (Left = Lane 0, Center = Lane 1, Right = Lane 2)
    const challenge = RACING_CHALLENGES[s.currentChallengeIdx % RACING_CHALLENGES.length];
    const laneWidth = (p.w * 2) / 3;

    for (let laneIdx = 0; laneIdx < 3; laneIdx++) {
      const laneX = (p.x - p.w) + laneWidth * laneIdx + laneWidth * 0.5;
      const isTarget = laneIdx === challenge.correct;

      // Floating Hologram Panel
      ctx.fillStyle = isTarget ? 'rgba(16, 185, 129, 0.75)' : 'rgba(56, 189, 248, 0.65)';
      const boxW = laneWidth * 0.88;
      const boxH = Math.max(18, archH * 0.4);
      ctx.fillRect(laneX - boxW * 0.5, archY + archH * 0.2, boxW, boxH);

      // Lane Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(laneX - boxW * 0.5, archY + archH * 0.2, boxW, boxH);

      // Text answer option
      const fontSize = Math.max(9, Math.floor(boxH * 0.38));
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const optText = challenge.options[laneIdx] || '';
      ctx.fillText(optText, laneX, archY + archH * 0.4);
    }
  };

  // Render Traffic Rivals with Realistic Tail Lights & Shadow
  const renderTrafficCar = (ctx, car, horizonY, h, roadBaseW, roadTopW, w, s) => {
    const p = project3D(car.z, horizonY, h, roadBaseW, roadTopW, w, s.roadCurve, s.playerX);
    const laneOffset = car.lane * (p.w * 0.62);
    const carX = p.x + laneOffset;
    const carW = Math.max(12, p.w * 0.22);
    const carH = carW * 0.6;
    const carY = p.y - carH;

    // Ground Shadow under traffic
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(carX, p.y - 2, carW * 0.6, carH * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Car Body
    ctx.fillStyle = car.color;
    ctx.fillRect(carX - carW * 0.5, carY, carW, carH);

    // Cabin / Windshield
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(carX - carW * 0.38, carY - carH * 0.35, carW * 0.76, carH * 0.4);

    // Glowing Red Taillights
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = Math.max(2, carW * 0.2);
    const lightW = carW * 0.2;
    const lightH = carH * 0.22;
    ctx.fillRect(carX - carW * 0.44, carY + carH * 0.4, lightW, lightH);
    ctx.fillRect(carX + carW * 0.44 - lightW, carY + carH * 0.4, lightW, lightH);
    ctx.shadowBlur = 0;
  };

  // Render High-Speed Warp / Speed Lines
  const renderSpeedLines = (ctx, w, h, speed, isBoosting) => {
    const count = isBoosting ? 24 : 14;
    ctx.strokeStyle = isBoosting ? 'rgba(56, 189, 248, 0.45)' : 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = isBoosting ? 2.5 : 1.5;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const len = 40 + Math.random() * (isBoosting ? 120 : 60);
      const startDist = 120 + Math.random() * 80;
      const cx = w * 0.5;
      const cy = h * 0.52;

      const x1 = cx + Math.cos(angle) * startDist;
      const y1 = cy + Math.sin(angle) * startDist;
      const x2 = cx + Math.cos(angle) * (startDist + len);
      const y2 = cy + Math.sin(angle) * (startDist + len);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  // Render Player Supercar (Rear Isometric Perspective)
  const renderPlayerCar = (ctx, w, h, s) => {
    const carX = w * 0.5;
    const carY = h * 0.82;
    const carW = Math.min(180, w * 0.28);
    const carH = carW * 0.58;

    // Ground Shadow with Diffuser Glow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.ellipse(carX, carY + carH * 0.95, carW * 0.65, carH * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tires with Camber tilt based on steering
    const steerAngle = s.keys.left ? -0.15 : s.keys.right ? 0.15 : 0;
    ctx.fillStyle = '#0f172a';
    // Left Tire
    ctx.save();
    ctx.translate(carX - carW * 0.46, carY + carH * 0.55);
    ctx.rotate(steerAngle);
    ctx.fillRect(-carW * 0.08, -carH * 0.25, carW * 0.16, carH * 0.5);
    ctx.restore();

    // Right Tire
    ctx.save();
    ctx.translate(carX + carW * 0.46, carY + carH * 0.55);
    ctx.rotate(steerAngle);
    ctx.fillRect(-carW * 0.08, -carH * 0.25, carW * 0.16, carH * 0.5);
    ctx.restore();

    // Aerodynamic Rear Body (Chassis)
    const bodyGrad = ctx.createLinearGradient(0, carY, 0, carY + carH);
    bodyGrad.addColorStop(0, '#1e293b');
    bodyGrad.addColorStop(0.5, '#0f172a');
    bodyGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(carX - carW * 0.42, carY + carH * 0.85);
    ctx.lineTo(carX - carW * 0.46, carY + carH * 0.35);
    ctx.lineTo(carX - carW * 0.32, carY);
    ctx.lineTo(carX + carW * 0.32, carY);
    ctx.lineTo(carX + carW * 0.46, carY + carH * 0.35);
    ctx.lineTo(carX + carW * 0.42, carY + carH * 0.85);
    ctx.closePath();
    ctx.fill();

    // Rear Windshield
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(carX - carW * 0.28, carY + carH * 0.12);
    ctx.lineTo(carX + carW * 0.28, carY + carH * 0.12);
    ctx.lineTo(carX + carW * 0.34, carY + carH * 0.36);
    ctx.lineTo(carX - carW * 0.34, carY + carH * 0.36);
    ctx.closePath();
    ctx.fill();

    // Carbon Fiber GT Wing / Spoiler
    ctx.fillStyle = '#090d16';
    ctx.fillRect(carX - carW * 0.5, carY - carH * 0.12, carW, carH * 0.14);
    // Wing Mounts
    ctx.fillRect(carX - carW * 0.25, carY - carH * 0.02, carW * 0.04, carH * 0.18);
    ctx.fillRect(carX + carW * 0.21, carY - carH * 0.02, carW * 0.04, carH * 0.18);

    // Glowing Cyber Taillight Strip
    const isBraking = s.keys.down;
    ctx.fillStyle = isBraking ? '#ff0033' : '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = isBraking ? 25 : 12;
    ctx.fillRect(carX - carW * 0.4, carY + carH * 0.44, carW * 0.8, carH * 0.08);
    ctx.shadowBlur = 0;

    // Dual Exhaust Nitro Backfire Flames
    if (s.speed > 50 || s.isBoosting) {
      const flameH = (s.isBoosting ? 45 : 18) + Math.random() * 12;
      const flameW = carW * 0.07;
      const flameGrad = ctx.createLinearGradient(0, carY + carH * 0.8, 0, carY + carH * 0.8 + flameH);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, s.isBoosting ? '#38bdf8' : '#3b82f6');
      flameGrad.addColorStop(0.8, s.isBoosting ? '#0284c7' : '#f97316');
      flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = flameGrad;

      // Left exhaust
      ctx.beginPath();
      ctx.ellipse(carX - carW * 0.22, carY + carH * 0.85 + flameH * 0.45, flameW, flameH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right exhaust
      ctx.beginPath();
      ctx.ellipse(carX + carW * 0.22, carY + carH * 0.85 + flameH * 0.45, flameW, flameH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Mobile / On-Screen Touch Controls
  const setKey = (key, val) => {
    stateRef.current.keys[key] = val;
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col items-center justify-between select-none overflow-hidden bg-slate-950 font-sans">
      {/* 3D Realistic Canvas Game View */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />

      {/* TOP DASHBOARD HUD (Speed Gate Question & Race Stats) */}
      <div className="relative z-10 w-full max-w-5xl px-4 pt-3 flex flex-col gap-2">
        {/* Active Speed Gate Challenge Banner */}
        {activeGate && (
          <div className="w-full bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 rounded-xl px-4 py-2.5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  SPEED GATE UPCOMING • STEER INTO CORRECT LANE
                </div>
                <div className="text-sm font-semibold text-white drop-shadow-sm">
                  {activeGate.q}
                </div>
              </div>
            </div>

            {/* Lane Answers Preview */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                [LANE 1] Left
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                [LANE 2] Mid
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                [LANE 3] Right
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Gate Feedback Alert */}
        {gateFeedback && (
          <div
            className={`w-full py-2 px-4 rounded-lg text-center font-bold text-sm tracking-wide shadow-lg border backdrop-blur-md animate-bounce ${
              gateFeedback.type === 'CORRECT'
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                : 'bg-rose-500/25 border-rose-400 text-rose-300'
            }`}
          >
            {gateFeedback.text}
          </div>
        )}
      </div>

      {/* BOTTOM CLUSTER: REALISTIC DIGITAL SPEEDOMETER & TELEMETRY */}
      <div className="relative z-10 w-full max-w-5xl px-4 pb-4 flex flex-col md:flex-row items-end justify-between gap-4 pointer-events-none">
        {/* Left Telemetry Cluster */}
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl pointer-events-auto">
          {/* Digital Speedometer */}
          <div className="flex flex-col items-center px-3 border-r border-slate-700/60">
            <span className="text-4xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
              {speed}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              KM / H
            </span>
          </div>

          {/* RPM & Gear */}
          <div className="flex flex-col gap-1 pr-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
              <span>GEAR <strong className="text-amber-400 text-sm">{gear}</strong></span>
              <span>{rpm} RPM</span>
            </div>
            {/* RPM Bar */}
            <div className="w-28 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-75 ${
                  rpm > 7000 ? 'bg-rose-500' : rpm > 5000 ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, (rpm / 8500) * 100)}%` }}
              />
            </div>

            {/* Nitro Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span className="flex items-center gap-1 font-semibold text-cyan-400">
                <Flame className="w-3 h-3" /> NITRO
              </span>
              <span className="font-mono text-cyan-300">{nitro}%</span>
            </div>
            <div className="w-28 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75"
                style={{ width: `${nitro}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Race Distance & Score */}
        <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-2.5 shadow-xl pointer-events-auto">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TIME LEFT</div>
            <div className="text-lg font-mono font-bold text-amber-400">{timeLeft}s</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-700/60" />
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DISTANCE</div>
            <div className="text-lg font-mono font-bold text-white">{distanceKm} km</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-700/60" />
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SCORE</div>
            <div className="text-lg font-mono font-bold text-cyan-400">{score}</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-700/60" />
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LIVES</div>
            <div className="text-lg font-mono font-bold text-rose-400">{'❤️'.repeat(lives)}</div>
          </div>
        </div>

        {/* Right: On-Screen Touch Controls (Mobile / Tablet Friendly) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onPointerDown={() => setKey('left', true)}
            onPointerUp={() => setKey('left', false)}
            onPointerLeave={() => setKey('left', false)}
            className="w-12 h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-cyan-500/40 border border-slate-600 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
            title="Steer Left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onPointerDown={() => setKey('right', true)}
            onPointerUp={() => setKey('right', false)}
            onPointerLeave={() => setKey('right', false)}
            className="w-12 h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-cyan-500/40 border border-slate-600 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
            title="Steer Right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onPointerDown={() => setKey('down', true)}
            onPointerUp={() => setKey('down', false)}
            onPointerLeave={() => setKey('down', false)}
            className="w-12 h-12 rounded-xl bg-rose-900/60 hover:bg-rose-800/60 active:bg-rose-600 border border-rose-500/50 flex items-center justify-center text-rose-200 active:scale-95 transition-all shadow-lg text-xs font-bold"
            title="Brake / Drift"
          >
            BRAKE
          </button>
          <button
            onPointerDown={() => setKey('up', true)}
            onPointerUp={() => setKey('up', false)}
            onPointerLeave={() => setKey('up', false)}
            className="w-14 h-12 rounded-xl bg-emerald-600/80 hover:bg-emerald-500/80 active:bg-emerald-400 border border-emerald-400 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg text-xs font-black uppercase tracking-wider"
            title="Throttle Gas"
          >
            GAS
          </button>
          <button
            onPointerDown={() => setKey('nitro', true)}
            onPointerUp={() => setKey('nitro', false)}
            onPointerLeave={() => setKey('nitro', false)}
            className="w-14 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 border border-cyan-300 flex items-center justify-center text-white transition-all shadow-lg text-xs font-black uppercase tracking-wider"
            title="Nitro Boost"
          >
            NITRO
          </button>
        </div>
      </div>
    </div>
  );
};

export default KineticCyberRacer;
