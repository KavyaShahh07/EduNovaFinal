import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Zap,
  Target,
  Shield,
  Crosshair,
  Flame,
  Award,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

// Aerospace & Physics Questions for Vector Navigation Rings
const AERO_CHALLENGES = [
  {
    q: 'Mach Number M = v / a_sound. If speed of sound is 300 m/s and jet flies at 900 m/s:',
    options: ['Mach 3.0 (Supersonic)', 'Mach 1.5 (Transonic)', 'Mach 0.9 (Subsonic)', 'Mach 6.0 (Hypersonic)'],
    correct: 0,
    explanation: 'Mach number = 900 m/s ÷ 300 m/s = Mach 3.0.'
  },
  {
    q: 'Aerodynamic Lift L = ½·ρ·v²·S·CL. If airspeed v doubles, lift force increases by:',
    options: ['4x (Lift ∝ v²)', '2x (Lift ∝ v)', '8x (Lift ∝ v³)', 'Unchanged'],
    correct: 0,
    explanation: 'Dynamic pressure q = ½ρv² scales quadratically with airspeed, generating 4x more lift.'
  },
  {
    q: 'Angle of Attack (AoA): Exceeding the critical angle of attack causes:',
    options: ['Aerodynamic Stall (Loss of Lift)', 'Instant Mach 5 Speed', 'Zero Air Drag', 'Negative Gravity'],
    correct: 0,
    explanation: 'Beyond critical AoA, airflow separates from the upper wing surface, causing an immediate stall.'
  },
  {
    q: 'Earth Orbital Escape Velocity ve = √(2GM/R). Earth escape velocity is approximately:',
    options: ['11.2 km/s (Mach ~33)', '1.5 km/s (Mach 4.5)', '25.0 km/s', '7.9 km/s (Orbital)'],
    correct: 0,
    explanation: 'Earth orbital velocity is ~7.9 km/s, while escape velocity to leave Earth gravity entirely is ~11.2 km/s.'
  },
  {
    q: 'At high altitude (60,000 ft), air density ρ is much lower than sea level. Therefore:',
    options: ['Parasitic drag is greatly reduced', 'Drag is 10x higher', 'Jet engines need zero air', 'Gravity drops to zero'],
    correct: 0,
    explanation: 'Thinner air produces far less parasitic air resistance, enabling extreme supersonic cruising speeds.'
  }
];

export const AeroGravityJet = ({
  isPaused = false,
  isMuted = false,
  isLight = false,
  onFinish = () => {},
  onAttempt = () => {},
  onChallengeChange = () => {}
}) => {
  const canvasRef = useRef(null);

  // Flight Stats
  const [mach, setMach] = useState(1.8);
  const [altitude, setAltitude] = useState(48500); // feet
  const [gForce, setGForce] = useState(1.0);
  const [score, setScore] = useState(0);
  const [bogeysDestroyed, setBogeysDestroyed] = useState(0);
  const [flareCount, setFlareCount] = useState(3);
  const [afterburnerFuel, setAfterburnerFuel] = useState(100);
  const [isAfterburning, setIsAfterburning] = useState(false);
  const [hullIntegrity, setHullIntegrity] = useState(100);
  const [timeLeft, setTimeLeft] = useState(90); // 90 second sortie
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [ringFeedback, setRingFeedback] = useState(null);
  const [isLockedOn, setIsLockedOn] = useState(false);

  // Mutable Game Loop State
  const stateRef = useRef({
    pitch: 0, // deg up/down
    roll: 0, // deg bank left/right
    yaw: 0,
    x: 0, // -1 to 1
    y: 0, // -1 to 1
    mach: 1.8,
    altitude: 48500,
    gForce: 1.0,
    afterburnerFuel: 100,
    isAfterburning: false,
    score: 0,
    bogeysDown: 0,
    flareCount: 3,
    hull: 100,
    shakeTime: 0,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      fire: false,
      flare: false,
      boost: false
    },
    lasers: [],
    flares: [],
    bogeys: [],
    vectorRings: [],
    particles: [],
    challengeIdx: 0,
    mistakes: [],
    lastLaserTime: 0,
    cloudOffset: 0
  });

  // Setup Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = true;
      if (k === 'arrowright' || k === 'd') keys.right = true;
      if (k === 'arrowup' || k === 'w') keys.up = true;
      if (k === 'arrowdown' || k === 's') keys.down = true;
      if (e.key === ' ' || k === 'enter') keys.fire = true;
      if (k === 'x' || k === 'f') keys.flare = true;
      if (k === 'shift') keys.boost = true;
    };

    const handleKeyUp = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = false;
      if (k === 'arrowright' || k === 'd') keys.right = false;
      if (k === 'arrowup' || k === 'w') keys.up = false;
      if (k === 'arrowdown' || k === 's') keys.down = false;
      if (e.key === ' ' || k === 'enter') keys.fire = false;
      if (k === 'x' || k === 'f') keys.flare = false;
      if (k === 'shift') keys.boost = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize Flight Corridor
  useEffect(() => {
    const s = stateRef.current;

    // Spawn initial bogeys / drones
    s.bogeys = [];
    for (let i = 0; i < 4; i++) {
      s.bogeys.push({
        id: i,
        x: (Math.random() - 0.5) * 1.4,
        y: (Math.random() - 0.5) * 1.0,
        z: 400 + i * 280,
        hp: 1,
        color: '#f43f5e'
      });
    }

    // Spawn first Vector Navigation Ring
    s.vectorRings = [
      {
        z: 750,
        challenge: AERO_CHALLENGES[0]
      }
    ];

    setActiveChallenge(AERO_CHALLENGES[0]);
    onChallengeChange({
      question: `Aero Mach 3: ${AERO_CHALLENGES[0].q}`,
      context: 'Fly through the matching vector ring quadrant to ignite Scramjet Afterburners!'
    });
  }, []);

  // Flight Timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishSortie();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const finishSortie = () => {
    const s = stateRef.current;
    soundManager.playVictory();
    const accuracy = Math.max(75, Math.min(100, 100 - s.mistakes.length * 7));

    onFinish({
      score: s.score,
      accuracy,
      mistakes: s.mistakes,
      maxCombo: s.bogeysDown,
      stats: {
        topMach: s.mach.toFixed(2),
        bogeysIntercepted: s.bogeysDown,
        altitudeReachesFt: Math.round(s.altitude)
      }
    });
  };

  // 60 FPS Flight Animation Loop
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
        updateAeroPhysics(dt, currentTime);
      }
      renderFlightSim(ctx, canvas);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isPaused]);

  const updateAeroPhysics = (dt, currentTime) => {
    const s = stateRef.current;
    const keys = s.keys;

    // Afterburner & Mach Throttling
    const wantsAfterburner = keys.boost && s.afterburnerFuel > 5;
    if (wantsAfterburner) {
      s.isAfterburning = true;
      s.mach = Math.min(3.8, s.mach + dt * 0.9);
      s.afterburnerFuel = Math.max(0, s.afterburnerFuel - dt * 20);
      if (Math.random() < 0.25) soundManager.playNitro();
    } else {
      s.isAfterburning = false;
      s.afterburnerFuel = Math.min(100, s.afterburnerFuel + dt * 5);
      // Cruise deceleration toward Mach 2.2
      if (s.mach > 2.2) s.mach -= dt * 0.35;
      else if (s.mach < 1.6) s.mach += dt * 0.2;
    }

    // Flight Dynamics (Pitch & Roll Banking)
    const pitchRate = 45; // deg/s
    const rollRate = 85;

    if (keys.up) {
      s.pitch = Math.max(-28, s.pitch - pitchRate * dt);
      s.y = Math.max(-0.85, s.y - 0.9 * dt);
      s.altitude += s.mach * 850 * dt;
    } else if (keys.down) {
      s.pitch = Math.min(28, s.pitch + pitchRate * dt);
      s.y = Math.min(0.85, s.y + 0.9 * dt);
      s.altitude = Math.max(12000, s.altitude - s.mach * 950 * dt);
    } else {
      s.pitch *= (1 - dt * 2.5); // Self-leveling
    }

    if (keys.left) {
      s.roll = Math.max(-42, s.roll - rollRate * dt);
      s.x = Math.max(-0.9, s.x - 1.2 * dt);
    } else if (keys.right) {
      s.roll = Math.min(42, s.roll + rollRate * dt);
      s.x = Math.min(0.9, s.x + 1.2 * dt);
    } else {
      s.roll *= (1 - dt * 3.0); // Self-righting
    }

    // Calculate Dynamic G-Force
    const rawG = 1.0 + Math.abs(s.pitch) / 8 + Math.abs(s.roll) / 12 + (s.isAfterburning ? 2.5 : 0);
    s.gForce = Math.min(9.0, rawG);

    // Score accumulation
    s.score += Math.floor(s.mach * 25 * dt);

    // Laser Cannon Firing
    if (keys.fire && currentTime - s.lastLaserTime > 180) {
      soundManager.playLaser();
      s.lastLaserTime = currentTime;
      // Dual wingtip laser bolts
      s.lasers.push(
        { x: s.x - 0.22, y: s.y + 0.1, z: 20, vz: 1400 },
        { x: s.x + 0.22, y: s.y + 0.1, z: 20, vz: 1400 }
      );
      s.shakeTime = 0.08;
    }

    // Flare Countermeasures
    if (keys.flare && s.flareCount > 0) {
      keys.flare = false; // consume trigger
      s.flareCount--;
      soundManager.playNitro();
      for (let i = 0; i < 6; i++) {
        s.flares.push({
          x: s.x + (Math.random() - 0.5) * 0.4,
          y: s.y + (Math.random() - 0.5) * 0.3,
          z: 30,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          life: 1.0
        });
      }
    }

    // Update Lasers
    for (let i = s.lasers.length - 1; i >= 0; i--) {
      const l = s.lasers[i];
      l.z += l.vz * dt;
      if (l.z > 950) s.lasers.splice(i, 1);
    }

    // Update Flares
    for (let i = s.flares.length - 1; i >= 0; i--) {
      const f = s.flares[i];
      f.life -= dt * 2.2;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.life <= 0) s.flares.splice(i, 1);
    }

    // Update Bogeys
    let targetLocked = false;
    s.bogeys.forEach(bogey => {
      bogey.z -= s.mach * 280 * dt;

      // Check laser collisions
      for (let li = s.lasers.length - 1; li >= 0; li--) {
        const l = s.lasers[li];
        const distZ = Math.abs(bogey.z - l.z);
        const distX = Math.abs(bogey.x - l.x);
        const distY = Math.abs(bogey.y - l.y);

        if (distZ < 40 && distX < 0.25 && distY < 0.25) {
          // BOGEY DESTROYED!
          soundManager.playExplosion();
          s.score += 250;
          s.bogeysDown++;
          bogey.z = 1000 + Math.random() * 400;
          bogey.x = (Math.random() - 0.5) * 1.5;
          bogey.y = (Math.random() - 0.5) * 1.1;
          s.lasers.splice(li, 1);
          break;
        }
      }

      // Check reticle lock-on
      const distToCenter = Math.hypot(bogey.x - s.x, bogey.y - s.y);
      if (bogey.z > 80 && bogey.z < 600 && distToCenter < 0.28) {
        targetLocked = true;
      }

      // Bogey passed or respawn
      if (bogey.z < 10) {
        bogey.z = 900 + Math.random() * 400;
        bogey.x = (Math.random() - 0.5) * 1.5;
        bogey.y = (Math.random() - 0.5) * 1.1;
      }
    });
    setIsLockedOn(targetLocked);

    // Update Vector Navigation Ring Checkpoints
    s.vectorRings.forEach(ring => {
      ring.z -= s.mach * 260 * dt;
      if (ring.z < 25) {
        evaluateAeroRing(ring);
        ring.z = 1100; // Next ring 1.1 km ahead
      }
    });

    // Cloud parallax offset
    s.cloudOffset += s.mach * 45 * dt;

    // React HUD states
    setMach(s.mach);
    setAltitude(Math.round(s.altitude));
    setGForce(s.gForce.toFixed(1));
    setScore(s.score);
    setBogeysDestroyed(s.bogeysDown);
    setFlareCount(s.flareCount);
    setAfterburnerFuel(Math.round(s.afterburnerFuel));
    setIsAfterburning(s.isAfterburning);
    setHullIntegrity(s.hull);
  };

  const evaluateAeroRing = (ring) => {
    const s = stateRef.current;
    const challenge = ring.challenge;

    // Quadrant navigation based on jet position (X, Y)
    // Top-Left (0), Top-Right (1), Bottom-Left (2), Bottom-Right (3)
    let quad = 0;
    if (s.x >= 0 && s.y < 0) quad = 1;
    else if (s.x < 0 && s.y >= 0) quad = 2;
    else if (s.x >= 0 && s.y >= 0) quad = 3;

    const isCorrect = quad === challenge.correct;

    if (isCorrect) {
      soundManager.playCorrect();
      soundManager.playNitro();
      s.mach = Math.min(3.8, s.mach + 0.8);
      s.afterburnerFuel = 100;
      s.score += 600;
      s.shakeTime = 0.35;
      setRingFeedback({ type: 'CORRECT', text: '🚀 VECTOR ALIGNED! SCRAMJET HYPERBOOST ENGAGED!' });
      onAttempt(null);
    } else {
      soundManager.playWrong();
      s.mach = Math.max(1.1, s.mach * 0.7);
      s.mistakes.push({
        question: challenge.q,
        userAnswer: challenge.options[quad] || 'Off Vector',
        correctAnswer: challenge.options[challenge.correct]
      });
      setRingFeedback({ type: 'WRONG', text: '⚠️ VECTOR MISALIGNMENT! AERODYNAMIC DRAG SPIKE!' });
      onAttempt({
        question: challenge.q,
        userAnswer: challenge.options[quad] || 'Off Vector',
        correctAnswer: challenge.options[challenge.correct]
      });
    }

    setTimeout(() => setRingFeedback(null), 3500);

    // Next challenge
    s.challengeIdx++;
    const nextChallenge = AERO_CHALLENGES[s.challengeIdx % AERO_CHALLENGES.length];
    ring.challenge = nextChallenge;
    setActiveChallenge(nextChallenge);
    onChallengeChange({
      question: `Aero Mach 3: ${nextChallenge.q}`,
      context: 'Align jet into the correct vector ring quadrant ahead to engage Mach boost!'
    });
  };

  // ================= 3D REALISTIC FLIGHT CANVAS RENDERING =================
  const renderFlightSim = (ctx, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const s = stateRef.current;

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    if (s.shakeTime > 0) {
      s.shakeTime -= 0.016;
      const shakeMag = s.isAfterburning ? 5 : 3;
      ctx.translate((Math.random() - 0.5) * shakeMag, (Math.random() - 0.5) * shakeMag);
    }

    // 1. HIGH-ALTITUDE STRATOSPHERE & SPACE SKY
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#020617'); // Space
    skyGrad.addColorStop(0.35, '#0a1931');
    skyGrad.addColorStop(0.65, '#1e3a8a');
    skyGrad.addColorStop(0.9, '#38bdf8');
    skyGrad.addColorStop(1, '#fed7aa'); // Distant sun glow at horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Distant Earth Horizon Curvature
    const horizonY = h * 0.62 + s.pitch * 3.5;
    ctx.save();
    ctx.translate(w * 0.5, horizonY);
    ctx.rotate((s.roll * Math.PI) / 180);

    // Curved Planet Surface
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 800, 920, Math.PI * 1.08, Math.PI * 1.92);
    ctx.fill();

    // Volumetric Rolling Cloud Blanket Beneath Jet
    const cloudY = 120;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    for (let cx = -w; cx <= w; cx += 90) {
      const cy = Math.sin((cx + s.cloudOffset) * 0.02) * 18 + cloudY;
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. VECTOR RINGS IN SKY
    s.vectorRings.forEach(ring => {
      if (ring.z > 20 && ring.z < 1000) {
        renderVectorRing(ctx, ring, w, h, s);
      }
    });

    // 3. ENEMY BOGEYS / DRONES
    s.bogeys.forEach(bogey => {
      if (bogey.z > 15 && bogey.z < 950) {
        renderBogey(ctx, bogey, w, h, s);
      }
    });

    // 4. LASER CANNON BOLTS
    s.lasers.forEach(l => {
      const scale = 1 / Math.max(1, l.z * 0.003 + 1);
      const lx = w * 0.5 + (l.x - s.x) * (w * 0.45) * scale;
      const ly = h * 0.5 + (l.y - s.y) * (h * 0.45) * scale;
      const lw = Math.max(3, 18 * scale);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = lw * 0.4;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx, ly + 25 * scale);
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // 5. FLARE COUNTERMEASURES
    s.flares.forEach(f => {
      const fx = w * 0.5 + (f.x - s.x) * (w * 0.4);
      const fy = h * 0.5 + (f.y - s.y) * (h * 0.4);
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(fx, fy, Math.max(2, f.life * 8), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 6. REALISTIC JET COCKPIT HEAD-UP DISPLAY (HUD)
    renderCockpitHUD(ctx, w, h, s);

    ctx.restore();
  };

  // Render Vector Navigation Ring with 4 Quadrants
  const renderVectorRing = (ctx, ring, w, h, s) => {
    const scale = 1 / Math.max(1, ring.z * 0.0035 + 1);
    const rx = w * 0.5 + (0 - s.x) * (w * 0.5) * scale;
    const ry = h * 0.5 + (0 - s.y) * (h * 0.5) * scale;
    const ringRadius = Math.max(35, (w * 0.28) * scale);

    // Glowing Hologram Ring
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = Math.max(2, 6 * scale);
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(rx, ry, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Crosshairs splitting into 4 quadrants
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rx - ringRadius, ry);
    ctx.lineTo(rx + ringRadius, ry);
    ctx.moveTo(rx, ry - ringRadius);
    ctx.lineTo(rx, ry + ringRadius);
    ctx.stroke();

    // Quadrant Badges
    const ch = ring.challenge;
    const quads = [
      { x: rx - ringRadius * 0.5, y: ry - ringRadius * 0.5, text: ch.options[0] }, // Top-Left
      { x: rx + ringRadius * 0.5, y: ry - ringRadius * 0.5, text: ch.options[1] }, // Top-Right
      { x: rx - ringRadius * 0.5, y: ry + ringRadius * 0.5, text: ch.options[2] }, // Bottom-Left
      { x: rx + ringRadius * 0.5, y: ry + ringRadius * 0.5, text: ch.options[3] }  // Bottom-Right
    ];

    quads.forEach((q, idx) => {
      const isTarget = idx === ch.correct;
      ctx.fillStyle = isTarget ? 'rgba(16, 185, 129, 0.85)' : 'rgba(15, 23, 42, 0.75)';
      const boxW = Math.max(40, ringRadius * 0.85);
      const boxH = Math.max(16, ringRadius * 0.3);
      ctx.fillRect(q.x - boxW * 0.5, q.y - boxH * 0.5, boxW, boxH);

      ctx.strokeStyle = isTarget ? '#34d399' : '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(q.x - boxW * 0.5, q.y - boxH * 0.5, boxW, boxH);

      const fSize = Math.max(8, Math.floor(boxH * 0.45));
      ctx.font = `bold ${fSize}px Inter, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(q.text || '', q.x, q.y);
    });
  };

  // Render Enemy Drones / Bogeys
  const renderBogey = (ctx, bogey, w, h, s) => {
    const scale = 1 / Math.max(1, bogey.z * 0.0035 + 1);
    const bx = w * 0.5 + (bogey.x - s.x) * (w * 0.5) * scale;
    const by = h * 0.5 + (bogey.y - s.y) * (h * 0.5) * scale;
    const size = Math.max(14, 45 * scale);

    // Drone Diamond Silhouette
    ctx.fillStyle = bogey.color;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(bx, by - size * 0.6);
    ctx.lineTo(bx + size * 0.6, by);
    ctx.lineTo(bx, by + size * 0.6);
    ctx.lineTo(bx - size * 0.6, by);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glowing Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  };

  // Render Realistic Head-Up Display (Collimated Cyan/Green Avionics)
  const renderCockpitHUD = (ctx, w, h, s) => {
    const cx = w * 0.5;
    const cy = h * 0.5;
    const hudColor = '#38bdf8';

    ctx.save();
    ctx.strokeStyle = hudColor;
    ctx.fillStyle = hudColor;
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 6;
    ctx.lineWidth = 1.5;

    // Artificial Horizon & Pitch Ladder (Tilts with Roll)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((-s.roll * Math.PI) / 180);

    // Horizon line
    ctx.beginPath();
    ctx.moveTo(-120, s.pitch * 3);
    ctx.lineTo(-40, s.pitch * 3);
    ctx.moveTo(40, s.pitch * 3);
    ctx.lineTo(120, s.pitch * 3);
    ctx.stroke();

    // Pitch rungs (+10, -10 deg)
    for (let p = -20; p <= 20; p += 10) {
      if (p === 0) continue;
      const ry = (s.pitch + p) * 3;
      ctx.beginPath();
      ctx.moveTo(-35, ry);
      ctx.lineTo(-15, ry);
      ctx.moveTo(15, ry);
      ctx.lineTo(35, ry);
      ctx.stroke();
    }
    ctx.restore();

    // Center Crosshair / Flight Path Vector
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Target Lock-On Reticle (Rotates if Locked)
    if (isLockedOn) {
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TARGET LOCK', cx, cy - 38);
      ctx.strokeStyle = hudColor;
      ctx.fillStyle = hudColor;
    }

    // Mach Speed Tape (Left Side of HUD)
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.strokeRect(cx - 180, cy - 80, 50, 160);
    ctx.fillText(`M ${s.mach.toFixed(2)}`, cx - 175, cy);

    // Altitude Tape (Right Side of HUD)
    ctx.textAlign = 'right';
    ctx.strokeRect(cx + 130, cy - 80, 60, 160);
    ctx.fillText(`${Math.round(s.altitude)} FT`, cx + 185, cy);

    ctx.restore();
  };

  const setKey = (k, val) => {
    stateRef.current.keys[k] = val;
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col items-center justify-between select-none overflow-hidden bg-slate-950 font-sans">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />

      {/* TOP FLIGHT HUD: Active Challenge & Objective */}
      <div className="relative z-10 w-full max-w-5xl px-4 pt-3 flex flex-col gap-2">
        {activeChallenge && (
          <div className="w-full bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 rounded-xl px-4 py-2.5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Compass className="w-4 h-4" />
              </span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  AEROSPACE VECTOR OBJECTIVE • ALIGN JET WITH QUADRANT
                </div>
                <div className="text-sm font-semibold text-white drop-shadow-sm">
                  {activeChallenge.q}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                [Q1] Top-L
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                [Q2] Top-R
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                [Q3] Bot-L
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                [Q4] Bot-R
              </span>
            </div>
          </div>
        )}

        {ringFeedback && (
          <div
            className={`w-full py-2 px-4 rounded-lg text-center font-bold text-sm tracking-wide shadow-lg border backdrop-blur-md animate-bounce ${
              ringFeedback.type === 'CORRECT'
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                : 'bg-rose-500/25 border-rose-400 text-rose-300'
            }`}
          >
            {ringFeedback.text}
          </div>
        )}
      </div>

      {/* BOTTOM CLUSTER: AVIONICS TELEMETRY & CONTROLS */}
      <div className="relative z-10 w-full max-w-5xl px-4 pb-4 flex flex-col md:flex-row items-end justify-between gap-4 pointer-events-none">
        {/* Left Flight Avionics */}
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl pointer-events-auto">
          <div className="flex flex-col items-center px-3 border-r border-slate-700/60">
            <span className="text-3xl font-black font-mono tracking-tighter text-cyan-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
              MACH {mach.toFixed(2)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              AIRSPEED
            </span>
          </div>

          <div className="flex flex-col gap-1 pr-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
              <span>G-FORCE <strong className="text-amber-400">{gForce}G</strong></span>
              <span>{altitude} FT</span>
            </div>
            {/* Afterburner Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span className="flex items-center gap-1 font-semibold text-cyan-400">
                <Flame className="w-3 h-3" /> AFTERBURNER
              </span>
              <span className="font-mono text-cyan-300">{afterburnerFuel}%</span>
            </div>
            <div className="w-28 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75"
                style={{ width: `${afterburnerFuel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Mission Clock & Score */}
        <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-2.5 shadow-xl pointer-events-auto">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SORTIE TIME</div>
            <div className="text-lg font-mono font-bold text-amber-400">{timeLeft}s</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-700/60" />
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">BOGEYS</div>
            <div className="text-lg font-mono font-bold text-rose-400">{bogeysDestroyed}</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-700/60" />
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SCORE</div>
            <div className="text-lg font-mono font-bold text-cyan-400">{score}</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-700/60" />
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">FLARES</div>
            <div className="text-lg font-mono font-bold text-amber-400">{flareCount}</div>
          </div>
        </div>

        {/* Right: On-Screen Touch Flight Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onPointerDown={() => setKey('left', true)}
              onPointerUp={() => setKey('left', false)}
              className="w-11 h-11 rounded-xl bg-slate-800/80 active:bg-cyan-500/40 border border-slate-600 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
              title="Bank Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onPointerDown={() => setKey('right', true)}
              onPointerUp={() => setKey('right', false)}
              className="w-11 h-11 rounded-xl bg-slate-800/80 active:bg-cyan-500/40 border border-slate-600 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
              title="Bank Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onPointerDown={() => setKey('up', true)}
              onPointerUp={() => setKey('up', false)}
              className="w-11 h-11 rounded-xl bg-slate-800/80 active:bg-cyan-500/40 border border-slate-600 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
              title="Pitch Down / Dive"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              onPointerDown={() => setKey('down', true)}
              onPointerUp={() => setKey('down', false)}
              className="w-11 h-11 rounded-xl bg-slate-800/80 active:bg-cyan-500/40 border border-slate-600 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
              title="Pitch Up / Climb"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>

          <button
            onPointerDown={() => setKey('fire', true)}
            onPointerUp={() => setKey('fire', false)}
            className="w-14 h-24 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-400 border border-rose-400 flex flex-col items-center justify-center text-white active:scale-95 transition-all shadow-xl font-black text-xs uppercase tracking-wider"
            title="Fire Laser Cannons"
          >
            <Target className="w-6 h-6 mb-1" />
            FIRE
          </button>

          <button
            onPointerDown={() => setKey('boost', true)}
            onPointerUp={() => setKey('boost', false)}
            className="w-14 h-24 rounded-xl bg-gradient-to-t from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 active:scale-95 border border-cyan-300 flex flex-col items-center justify-center text-white transition-all shadow-xl font-black text-xs uppercase tracking-wider"
            title="Scramjet Afterburner"
          >
            <Flame className="w-6 h-6 mb-1" />
            MACH
          </button>
        </div>
      </div>
    </div>
  );
};

export default AeroGravityJet;
