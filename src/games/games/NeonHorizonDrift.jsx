import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Zap,
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

// STEM Traction & Drift Physics Questions
const DRIFT_CHALLENGES = [
  {
    q: 'Friction Dynamics: When tires break loose into a drift, tire friction transitions from:',
    options: ['Static friction to Kinetic friction (lower grip)', 'Kinetic to Static friction', 'Zero friction to Infinite grip', 'Aerodynamic drag to Gravity'],
    correct: 0,
    explanation: 'Static friction μs is higher than kinetic (sliding) friction μk. Once tires slip, grip drops, allowing controlled sliding.'
  },
  {
    q: 'Centripetal Acceleration a_c = v² / r. If you take a hairpin turn at twice the speed (2v):',
    options: ['Lateral tire stress increases by 4x', 'Tire stress increases by 2x', 'Tire stress is cut in half', 'Unchanged'],
    correct: 0,
    explanation: 'Centripetal acceleration is proportional to the square of velocity (v²). Doubling cornering speed quadruples lateral load!'
  },
  {
    q: 'Counter-Steering Technique: To sustain and control an oversteer slide to the left, you must:',
    options: ['Steer right into the direction of the slide', 'Steer left even harder', 'Lock the front brakes only', 'Turn off the steering wheel'],
    correct: 0,
    explanation: 'Counter-steering points front wheels in the direction of vehicle trajectory, stabilizing the rear slide angle.'
  },
  {
    q: 'Weight Transfer: Tapping the brakes just before corner turn-in causes:',
    options: ['Weight shifts to front wheels, increasing front grip', 'Weight shifts rearward', 'All 4 tires lose contact', 'Car flips backward'],
    correct: 0,
    explanation: 'Forward weight transfer compresses front suspension, increasing front tire normal force and steering bite for apex rotation.'
  },
  {
    q: 'Ideal Racing Line: The classic cornering principle to maximize exit velocity is:',
    options: ['Slow In, Fast Out (Late Apex)', 'Fast In, Slow Out', 'Brake at the center of the corner', 'Never brake at all'],
    correct: 0,
    explanation: 'A late apex line allows straightening the car earlier, applying full throttle sooner down the following straightaway!'
  }
];

export const NeonHorizonDrift = ({
  isPaused = false,
  isMuted = false,
  isLight = false,
  onFinish = () => {},
  onAttempt = () => {},
  onChallengeChange = () => {}
}) => {
  const canvasRef = useRef(null);

  // Drift Game States
  const [speed, setSpeed] = useState(0);
  const [driftAngle, setDriftAngle] = useState(0);
  const [driftScore, setDriftScore] = useState(0);
  const [driftMultiplier, setDriftMultiplier] = useState(1);
  const [isDrifting, setIsDrifting] = useState(false);
  const [nitroFuel, setNitroFuel] = useState(100);
  const [totalScore, setTotalScore] = useState(0);
  const [lapsCompleted, setLapsCompleted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [driftFeedback, setDriftFeedback] = useState(null);

  // Mutable Physics State for 60 FPS loop
  const stateRef = useRef({
    carX: 0,
    carY: 0,
    carAngle: 0, // radians
    headingAngle: 0,
    speed: 0, // km/h
    slipAngle: 0, // drift angle in deg
    driftPoints: 0,
    multiplier: 1,
    isDrifting: false,
    nitro: 100,
    isBoosting: false,
    totalScore: 0,
    laps: 0,
    trackProgress: 0,
    trackSegments: [],
    skidMarks: [],
    smokeParticles: [],
    sparkParticles: [],
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      handbrake: false,
      nitro: false
    },
    shakeTime: 0,
    challengeIdx: 0,
    mistakes: [],
    lastSkidSound: 0
  });

  // Setup Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = true;
      if (k === 'arrowright' || k === 'd') keys.right = true;
      if (k === 'arrowup' || k === 'w') keys.up = true;
      if (k === 'arrowdown' || k === 's') keys.down = true;
      if (e.key === ' ' || k === 'shift') keys.handbrake = true;
      if (k === 'e' || k === 'n') keys.nitro = true;
    };

    const handleKeyUp = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = false;
      if (k === 'arrowright' || k === 'd') keys.right = false;
      if (k === 'arrowup' || k === 'w') keys.up = false;
      if (k === 'arrowdown' || k === 's') keys.down = false;
      if (e.key === ' ' || k === 'shift') keys.handbrake = false;
      if (k === 'e' || k === 'n') keys.nitro = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize Track & First Challenge
  useEffect(() => {
    const s = stateRef.current;
    setActiveChallenge(DRIFT_CHALLENGES[0]);
    onChallengeChange({
      question: `Neon Drift: ${DRIFT_CHALLENGES[0].q}`,
      context: 'Drift through the corner and select the correct apex physics answer!'
    });
  }, []);

  // Lap / Countdown Timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishDriftSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const finishDriftSession = () => {
    const s = stateRef.current;
    soundManager.playVictory();
    const accuracy = Math.max(70, Math.min(100, 100 - s.mistakes.length * 8));

    onFinish({
      score: s.totalScore + Math.floor(s.driftPoints),
      accuracy,
      mistakes: s.mistakes,
      maxCombo: s.multiplier,
      stats: {
        totalDriftScore: Math.floor(s.driftPoints),
        lapsCompleted: s.laps,
        topDriftAngle: `${Math.round(s.slipAngle)}°`
      }
    });
  };

  // 60 FPS Drift Simulation Loop
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!isPaused) {
        updateDriftPhysics(dt, currentTime);
      }
      renderDriftTrack(ctx, canvas);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isPaused]);

  // Update Drift Physics
  const updateDriftPhysics = (dt, currentTime) => {
    const s = stateRef.current;
    const keys = s.keys;

    // Acceleration & Braking
    const accelRate = 75;
    const brakeRate = 140;
    const friction = 22;

    const wantsBoost = keys.nitro && s.nitro > 5;
    if (wantsBoost) {
      s.isBoosting = true;
      s.speed = Math.min(260, s.speed + accelRate * 1.8 * dt);
      s.nitro = Math.max(0, s.nitro - dt * 25);
      if (Math.random() < 0.25) soundManager.playNitro();
    } else {
      s.isBoosting = false;
      s.nitro = Math.min(100, s.nitro + dt * 4);
    }

    if (keys.up) {
      s.speed = Math.min(220, s.speed + accelRate * dt);
    } else if (keys.down) {
      s.speed = Math.max(0, s.speed - brakeRate * dt);
    } else {
      s.speed = Math.max(0, s.speed - friction * dt);
    }

    // Steering & Angular Rotation
    const steerSpeed = 2.4;
    let steerDir = 0;
    if (keys.left) steerDir -= 1;
    if (keys.right) steerDir += 1;

    // Handbrake initiates drift slip
    const isHandbraking = keys.handbrake && s.speed > 40;

    // Update car heading vs car body orientation (Slip Angle!)
    s.headingAngle += steerDir * steerSpeed * (s.speed / 180 + 0.3) * dt;

    if (isHandbraking || (Math.abs(steerDir) > 0 && s.speed > 90)) {
      // Slip angle increases
      const targetSlip = steerDir * (isHandbraking ? 48 : 28);
      s.slipAngle += (targetSlip - s.slipAngle) * dt * 4.5;
      s.isDrifting = Math.abs(s.slipAngle) > 12;
    } else {
      // Regaining traction
      s.slipAngle *= (1 - dt * 4.0);
      s.isDrifting = Math.abs(s.slipAngle) > 12;
    }

    s.carAngle = s.headingAngle + (s.slipAngle * Math.PI) / 180;

    // Audio Skid
    if (s.isDrifting && currentTime - s.lastSkidSound > 160 && s.speed > 50) {
      soundManager.playSkid();
      s.lastSkidSound = currentTime;
    }

    // Drift Scoring & Combo Multiplier
    if (s.isDrifting && s.speed > 40) {
      const angleMultiplier = Math.abs(s.slipAngle) / 20;
      const pointsGain = (s.speed * 0.4 * angleMultiplier * s.multiplier) * dt;
      s.driftPoints += pointsGain;
      s.multiplier = Math.min(8, s.multiplier + dt * 0.5);

      // Spawn Tire Smoke & Skid Marks
      if (Math.random() < 0.6) {
        s.smokeParticles.push({
          x: s.carX + (Math.random() - 0.5) * 20,
          y: s.carY + 25,
          life: 1.0,
          size: 6 + Math.random() * 8
        });
      }
    } else {
      // Bank drift points into total score
      if (s.driftPoints > 0) {
        s.totalScore += Math.floor(s.driftPoints);
        s.driftPoints = 0;
        s.multiplier = 1;
      }
    }

    // Update Smoke Particles
    for (let i = s.smokeParticles.length - 1; i >= 0; i--) {
      const p = s.smokeParticles[i];
      p.life -= dt * 2.2;
      p.size += dt * 14;
      p.y += dt * 12;
      if (p.life <= 0) s.smokeParticles.splice(i, 1);
    }

    // Track progression and laps
    const speedMps = (s.speed * 1000) / 3600;
    s.trackProgress += speedMps * dt;
    if (s.trackProgress > 1800) {
      s.trackProgress = 0;
      s.laps++;
      soundManager.playLevelUp();
    }

    // React HUD states
    setSpeed(Math.round(s.speed));
    setDriftAngle(Math.round(Math.abs(s.slipAngle)));
    setDriftScore(Math.floor(s.driftPoints));
    setDriftMultiplier(Math.round(s.multiplier * 10) / 10);
    setIsDrifting(s.isDrifting);
    setNitroFuel(Math.round(s.nitro));
    setTotalScore(s.totalScore);
    setLapsCompleted(s.laps);
  };

  const handleSelectOption = (idx) => {
    const s = stateRef.current;
    const challenge = DRIFT_CHALLENGES[s.challengeIdx % DRIFT_CHALLENGES.length];
    const isCorrect = idx === challenge.correct;

    if (isCorrect) {
      soundManager.playCorrect();
      soundManager.playNitro();
      s.speed = Math.min(260, s.speed + 60);
      s.nitro = 100;
      s.totalScore += 500;
      s.multiplier = Math.min(8, s.multiplier + 2);
      setDriftFeedback({ type: 'CORRECT', text: '🔥 APEX MASTERED! SUPER DRIFT SLINGSHOT BOOST!' });
      onAttempt(null);
    } else {
      soundManager.playWrong();
      s.speed = Math.max(40, s.speed * 0.6);
      s.multiplier = 1;
      s.mistakes.push({
        question: challenge.q,
        chosen: challenge.options[idx],
        correct: challenge.options[challenge.correct]
      });
      setDriftFeedback({ type: 'WRONG', text: '⚠️ TRACTION LOSS! APEX TIMING MISSED!' });
      onAttempt({
        question: challenge.q,
        userAnswer: challenge.options[idx],
        correctAnswer: challenge.options[challenge.correct]
      });
    }

    setTimeout(() => setDriftFeedback(null), 3000);

    // Advance Challenge
    s.challengeIdx++;
    const nextChallenge = DRIFT_CHALLENGES[s.challengeIdx % DRIFT_CHALLENGES.length];
    setActiveChallenge(nextChallenge);
    onChallengeChange({
      question: `Neon Drift: ${nextChallenge.q}`,
      context: 'Select the optimal traction physics option to power out of the turn!'
    });
  };

  // ================= REALISTIC DRIFT CIRCUIT CANVAS RENDERING =================
  const renderDriftTrack = (ctx, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const s = stateRef.current;

    ctx.clearRect(0, 0, w, h);

    // 1. WET MIDNIGHT CITY ASPHALT BACKGROUND
    const groundGrad = ctx.createLinearGradient(0, 0, 0, h);
    groundGrad.addColorStop(0, '#020617');
    groundGrad.addColorStop(0.4, '#090d16');
    groundGrad.addColorStop(1, '#05070d');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 0, w, h);

    // Neon City Skyline in Background
    ctx.fillStyle = '#0f172a';
    const cityY = h * 0.28;
    for (let bx = 0; bx < w; bx += 45) {
      const bh = Math.sin(bx * 0.05) * 50 + 70;
      ctx.fillRect(bx, cityY - bh, 40, bh);
      // Windows
      ctx.fillStyle = Math.random() < 0.2 ? '#38bdf8' : '#fbbf24';
      ctx.fillRect(bx + 10, cityY - bh + 15, 6, 8);
      ctx.fillStyle = '#0f172a';
    }

    // 2. CURVED WET ASPHALT RACETRACK WITH NEON REFLECTIONS
    const trackY = h * 0.65;
    const trackW = w * 0.85;

    // Track Border Barriers (Glowing Neon Blue/Pink Striping)
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, trackY - 120);
    ctx.bezierCurveTo(w * 0.35, trackY - 180, w * 0.65, trackY - 80, w * 0.95, trackY - 140);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.shadowColor = '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(w * 0.05, trackY + 120);
    ctx.bezierCurveTo(w * 0.35, trackY + 80, w * 0.65, trackY + 160, w * 0.95, trackY + 100);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Wet Asphalt Puddles with Ambient Glow
    const puddleGrad = ctx.createRadialGradient(w * 0.5, trackY, 20, w * 0.5, trackY, 180);
    puddleGrad.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
    puddleGrad.addColorStop(0.6, 'rgba(236, 72, 153, 0.12)');
    puddleGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = puddleGrad;
    ctx.fillRect(w * 0.1, trackY - 100, w * 0.8, 200);

    // 3. TIRE SMOKE PARTICLES
    s.smokeParticles.forEach(p => {
      ctx.fillStyle = `rgba(240, 249, 255, ${p.life * 0.45})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. DRIFT RACING CAR (Rendered at center with dynamic slip angle)
    renderDriftCar(ctx, w * 0.5, trackY, s);
  };

  // Render High-Performance Drift Car with Slip Angle Rotation
  const renderDriftCar = (ctx, cx, cy, s) => {
    const carW = 60;
    const carH = 110;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((s.slipAngle * Math.PI) / 180);

    // Wet asphalt ground reflection
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 0, carW * 0.75, carH * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Car Body (Aerodynamic Cyber Silhouette)
    const carGrad = ctx.createLinearGradient(-carW * 0.5, 0, carW * 0.5, 0);
    carGrad.addColorStop(0, '#0f172a');
    carGrad.addColorStop(0.5, '#38bdf8');
    carGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = carGrad;

    ctx.beginPath();
    ctx.roundRect(-carW * 0.5, -carH * 0.5, carW, carH, 14);
    ctx.fill();

    // Windshield & Roof
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.roundRect(-carW * 0.35, -carH * 0.2, carW * 0.7, carH * 0.45, 8);
    ctx.fill();

    // Glowing Neon Headlights (Front)
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.fillRect(-carW * 0.42, -carH * 0.48, carW * 0.25, 6);
    ctx.fillRect(carW * 0.17, -carH * 0.48, carW * 0.25, 6);

    // Glowing Red Taillights (Rear)
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 14;
    ctx.fillRect(-carW * 0.42, carH * 0.44, carW * 0.28, 6);
    ctx.fillRect(carW * 0.14, carH * 0.44, carW * 0.28, 6);
    ctx.shadowBlur = 0;

    // Nitro Flame Thrust if Boosting
    if (s.isBoosting || s.speed > 160) {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(-carW * 0.15, carH * 0.5);
      ctx.lineTo(0, carH * 0.5 + 32 + Math.random() * 15);
      ctx.lineTo(carW * 0.15, carH * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  };

  const setKey = (k, v) => {
    stateRef.current.keys[k] = v;
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col items-center justify-between select-none overflow-hidden bg-slate-950 font-sans">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />

      {/* TOP DRIFT HUD: Challenge & Apex Question */}
      <div className="relative z-10 w-full max-w-5xl px-4 pt-3 flex flex-col gap-2">
        {activeChallenge && (
          <div className="w-full bg-slate-900/85 backdrop-blur-md border border-fuchsia-500/40 rounded-xl px-4 py-2.5 shadow-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
                  <Flame className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-400">
                  APEX TRACTION CHALLENGE • POWER OUT OF DRIFT
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-amber-400">
                LAP {lapsCompleted + 1}
              </div>
            </div>

            <div className="text-sm font-semibold text-white drop-shadow-sm">
              {activeChallenge.q}
            </div>

            {/* Answer Option Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              {activeChallenge.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-fuchsia-600/30 active:scale-95 border border-slate-700 hover:border-fuchsia-400 text-xs font-medium text-slate-200 transition-all text-left truncate"
                  title={opt}
                >
                  <strong className="text-fuchsia-400 mr-1.5">{idx + 1}.</strong> {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {driftFeedback && (
          <div
            className={`w-full py-2 px-4 rounded-lg text-center font-bold text-sm tracking-wide shadow-lg border backdrop-blur-md animate-bounce ${
              driftFeedback.type === 'CORRECT'
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                : 'bg-rose-500/25 border-rose-400 text-rose-300'
            }`}
          >
            {driftFeedback.text}
          </div>
        )}
      </div>

      {/* BOTTOM CLUSTER: DRIFT ANGLE GAUGE & DASHBOARD */}
      <div className="relative z-10 w-full max-w-5xl px-4 pb-4 flex flex-col md:flex-row items-end justify-between gap-4 pointer-events-none">
        {/* Left Telemetry Cluster */}
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl pointer-events-auto">
          <div className="flex flex-col items-center px-3 border-r border-slate-700/60">
            <span className="text-4xl font-black font-mono tracking-tighter text-fuchsia-400 drop-shadow-[0_0_12px_rgba(236,72,153,0.5)]">
              {speed}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              KM / H
            </span>
          </div>

          <div className="flex flex-col gap-1 pr-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
              <span>SLIP ANGLE <strong className="text-amber-400">{driftAngle}°</strong></span>
              <span>{isDrifting ? '🔥 DRIFTING!' : 'GRIP'}</span>
            </div>
            {/* Nitro Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span className="flex items-center gap-1 font-semibold text-fuchsia-400">
                <Flame className="w-3 h-3" /> NITRO BOOST
              </span>
              <span className="font-mono text-fuchsia-300">{nitroFuel}%</span>
            </div>
            <div className="w-28 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 transition-all duration-75"
                style={{ width: `${nitroFuel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Drift Points & Combo */}
        <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-2.5 shadow-xl pointer-events-auto">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SESSION TIME</div>
            <div className="text-lg font-mono font-bold text-amber-400">{timeLeft}s</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-700/60" />
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DRIFT SCORE</div>
            <div className="text-lg font-mono font-bold text-fuchsia-400">+{driftScore}</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-700/60" />
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">MULTIPLIER</div>
            <div className="text-lg font-mono font-bold text-cyan-400">{driftMultiplier}x</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-700/60" />
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TOTAL SCORE</div>
            <div className="text-lg font-mono font-bold text-white">{totalScore}</div>
          </div>
        </div>

        {/* Right: Touch Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onPointerDown={() => setKey('left', true)}
            onPointerUp={() => setKey('left', false)}
            className="w-12 h-12 rounded-xl bg-slate-800/80 active:bg-fuchsia-500/40 border border-slate-600 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
            title="Steer Left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onPointerDown={() => setKey('right', true)}
            onPointerUp={() => setKey('right', false)}
            className="w-12 h-12 rounded-xl bg-slate-800/80 active:bg-fuchsia-500/40 border border-slate-600 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
            title="Steer Right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onPointerDown={() => setKey('handbrake', true)}
            onPointerUp={() => setKey('handbrake', false)}
            className="w-14 h-12 rounded-xl bg-fuchsia-600/80 hover:bg-fuchsia-500 active:bg-fuchsia-400 border border-fuchsia-400 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg font-black text-xs uppercase tracking-wider"
            title="Handbrake Drift"
          >
            DRIFT
          </button>
          <button
            onPointerDown={() => setKey('up', true)}
            onPointerUp={() => setKey('up', false)}
            className="w-14 h-12 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 active:bg-emerald-400 border border-emerald-400 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg font-black text-xs uppercase tracking-wider"
            title="Throttle"
          >
            GAS
          </button>
          <button
            onPointerDown={() => setKey('nitro', true)}
            onPointerUp={() => setKey('nitro', false)}
            className="w-14 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 border border-cyan-300 flex items-center justify-center text-white transition-all shadow-lg font-black text-xs uppercase tracking-wider"
            title="Nitro Boost"
          >
            NITRO
          </button>
        </div>
      </div>
    </div>
  );
};

export default NeonHorizonDrift;
