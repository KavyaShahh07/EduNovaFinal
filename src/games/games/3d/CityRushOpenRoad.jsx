import React, { useState, useEffect, useRef } from 'react';
import {
  Gauge,
  Trophy,
  RotateCcw,
  Sparkles,
  Zap,
  Award,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Navigation,
  ShieldAlert
} from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const CityRushOpenRoad = ({
  isPaused = false,
  isMuted = false,
  isLight = false,
  onFinish = () => {},
  onAttempt = () => {}
}) => {
  const canvasRef = useRef(null);

  // HUD & Game State
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [checkpoints, setCheckpoints] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(75);
  const [nitro, setNitro] = useState(100);
  const [collisions, setCollisions] = useState(0);

  // Mutable state for 60fps WebGL/Canvas loop
  const stateRef = useRef({
    carX: 0, // -1 (left lane) to 1 (right lane)
    carZ: 0,
    speed: 0, // 0 to 180 km/h
    targetSpeed: 0,
    distance: 0,
    score: 0,
    checkpoints: 0,
    nitro: 100,
    isBoosting: false,
    collisions: 0,
    buildings: [],
    traffic: [],
    checkPointGates: [],
    particles: [],
    keys: { left: false, right: false, up: false, down: false, boost: false },
    shake: 0
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
      if (e.key === ' ' || k === 'shift') keys.boost = true;
    };

    const handleKeyUp = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = false;
      if (k === 'arrowright' || k === 'd') keys.right = false;
      if (k === 'arrowup' || k === 'w') keys.up = false;
      if (k === 'arrowdown' || k === 's') keys.down = false;
      if (e.key === ' ' || k === 'shift') keys.boost = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize City 3D Environment
  useEffect(() => {
    const s = stateRef.current;
    // Generate 3D City Buildings
    const buildings = [];
    for (let i = 0; i < 40; i++) {
      buildings.push({
        z: i * 80,
        side: i % 2 === 0 ? -1 : 1,
        width: 40 + Math.random() * 30,
        height: 60 + Math.random() * 120,
        color: ['#1e293b', '#0f172a', '#334155', '#1e1b4b', '#064e3b'][Math.floor(Math.random() * 5)],
        windowsColor: ['#38bdf8', '#f59e0b', '#34d399', '#c084fc'][Math.floor(Math.random() * 4)]
      });
    }

    // Generate Traffic Vehicles
    const traffic = [];
    for (let i = 0; i < 15; i++) {
      traffic.push({
        lane: (Math.random() > 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.45),
        z: 200 + i * 150 + Math.random() * 80,
        speed: 30 + Math.random() * 40,
        color: ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899'][Math.floor(Math.random() * 5)]
      });
    }

    // Generate Checkpoint Archways
    const checkPointGates = [];
    for (let i = 1; i <= 10; i++) {
      checkPointGates.push({ z: i * 500, passed: false });
    }

    s.buildings = buildings;
    s.traffic = traffic;
    s.checkPointGates = checkPointGates;
  }, []);

  // Timer interval
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const s = stateRef.current;
          onFinish({
            score: Math.round(s.score),
            accuracy: Math.max(50, 100 - s.collisions * 8),
            durationSeconds: 75,
            combo: s.checkpoints,
            level: 1
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, onFinish]);

  // Main 60 FPS Render & Physics Loop
  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      if (!isPaused && ctx) {
        const s = stateRef.current;
        const width = canvas.width = canvas.parentElement?.clientWidth || 900;
        const height = canvas.height = canvas.parentElement?.clientHeight || 550;

        // 1. Controls & Acceleration Physics
        if (s.keys.up) s.speed = Math.min(160, s.speed + 1.2);
        else if (s.keys.down) s.speed = Math.max(0, s.speed - 2.5);
        else s.speed = Math.max(0, s.speed - 0.5);

        if (s.keys.boost && s.nitro > 0 && s.speed > 20) {
          s.speed = Math.min(210, s.speed + 2.5);
          s.nitro = Math.max(0, s.nitro - 0.4);
          s.shake = 3;
          s.particles.push({
            x: width / 2 + (s.carX * width * 0.3),
            y: height * 0.85,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 5 + 3,
            size: Math.random() * 6 + 4,
            color: '#06b6d4',
            life: 1.0
          });
        } else if (s.nitro < 100) {
          s.nitro = Math.min(100, s.nitro + 0.1);
        }

        // Steering logic
        const steerSpeed = (0.018 * s.speed) / 100;
        if (s.keys.left) s.carX = Math.max(-0.9, s.carX - steerSpeed);
        if (s.keys.right) s.carX = Math.min(0.9, s.carX + steerSpeed);

        s.distance += (s.speed / 3600) * 10;
        s.score += (s.speed * 0.05);

        if (s.shake > 0) s.shake *= 0.9;

        // 2. Clear Screen & Draw Skybox/Horizon
        ctx.fillStyle = '#050b18';
        ctx.fillRect(0, 0, width, height);

        const shakeX = (Math.random() - 0.5) * s.shake;
        const shakeY = (Math.random() - 0.5) * s.shake;
        ctx.save();
        ctx.translate(shakeX, shakeY);

        const horizonY = height * 0.45;

        // Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, horizonY);

        // Sun / Neon City Glow
        ctx.beginPath();
        ctx.arc(width / 2, horizonY - 10, 70, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.fill();

        // 3. Render 3D City Road Perspective
        ctx.beginPath();
        ctx.moveTo(width / 2 - 40, horizonY);
        ctx.lineTo(width / 2 + 40, horizonY);
        ctx.lineTo(width * 0.95, height);
        ctx.lineTo(width * 0.05, height);
        ctx.closePath();
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Road Lane Lines
        const dashOffset = (s.distance * 100) % 40;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 3;
        ctx.setLineDash([20, 20]);
        ctx.lineDashOffset = -dashOffset;
        ctx.beginPath();
        ctx.moveTo(width / 2, horizonY);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.setLineDash([]);

        // 4. Render 3D City Buildings
        s.buildings.forEach(b => {
          b.z -= s.speed * 0.3;
          if (b.z < -50) b.z += 3200;

          const perspective = 300 / (b.z + 100);
          if (perspective > 0 && b.z > 0) {
            const bx = width / 2 + (b.side * (width * 0.45) * perspective) + (b.side * 120);
            const bw = b.width * perspective * 2;
            const bh = b.height * perspective * 2;
            const by = horizonY - bh;

            ctx.fillStyle = b.color;
            ctx.fillRect(bx - bw / 2, by, bw, bh);
            ctx.strokeStyle = '#38bdf822';
            ctx.strokeRect(bx - bw / 2, by, bw, bh);

            // Windows
            ctx.fillStyle = b.windowsColor;
            for (let wy = by + 10; wy < by + bh - 10; wy += 15 * perspective) {
              for (let wx = bx - bw / 2 + 5; wx < bx + bw / 2 - 5; wx += 12 * perspective) {
                if (Math.random() > 0.3) {
                  ctx.fillRect(wx, wy, 4 * perspective, 6 * perspective);
                }
              }
            }
          }
        });

        // 5. Render Checkpoint Gates
        s.checkPointGates.forEach(g => {
          g.z -= s.speed * 0.3;
          if (g.z < -20) g.z += 5000;

          const p = 300 / (g.z + 100);
          if (p > 0 && g.z > 0 && g.z < 1200) {
            const gx = width / 2;
            const gy = horizonY + (height * 0.4 * (1 - p));
            const gw = width * 0.7 * p;
            const gh = 90 * p;

            ctx.strokeStyle = g.passed ? '#10b981' : '#f59e0b';
            ctx.lineWidth = Math.max(3, 8 * p);
            ctx.strokeRect(gx - gw / 2, gy - gh, gw, gh);

            ctx.fillStyle = g.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)';
            ctx.fillRect(gx - gw / 2, gy - gh, gw, gh);

            // Checkpoint Hit
            if (g.z < 30 && g.z > -10 && !g.passed) {
              g.passed = true;
              s.checkpoints += 1;
              s.score += 500;
              s.nitro = Math.min(100, s.nitro + 35);
              soundManager.playCorrect();
            }
          }
        });

        // 6. Render Traffic Vehicles
        s.traffic.forEach(t => {
          t.z -= (s.speed - t.speed) * 0.25;
          if (t.z < -30) {
            t.z += 1500;
            t.lane = (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.5);
          }

          const p = 300 / (t.z + 100);
          if (p > 0 && t.z > 0 && t.z < 1200) {
            const tx = width / 2 + (t.lane * width * 0.4 * (1 - p * 0.3));
            const ty = horizonY + (height * 0.45 * (1 - p));
            const tw = 65 * p;
            const th = 40 * p;

            ctx.fillStyle = t.color;
            ctx.fillRect(tx - tw / 2, ty - th, tw, th);
            ctx.fillStyle = '#000';
            ctx.fillRect(tx - tw / 2 + 4, ty - th + 4, tw - 8, th / 2);

            // Collision Check
            if (t.z < 25 && t.z > -10 && Math.abs(s.carX - t.lane) < 0.22) {
              s.collisions += 1;
              s.speed = Math.max(20, s.speed - 50);
              s.shake = 12;
              soundManager.playTone(150, 'sawtooth', 0.2);
              t.z += 300; // Bounce away
            }
          }
        });

        // 7. Render Player 3D Car
        const playerX = width / 2 + (s.carX * width * 0.38);
        const playerY = height * 0.82;
        const carW = 90;
        const carH = 48;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(playerX, playerY + 20, carW * 0.6, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Car Body
        const carGrad = ctx.createLinearGradient(playerX - carW / 2, playerY, playerX + carW / 2, playerY + carH);
        carGrad.addColorStop(0, '#0284c7');
        carGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = carGrad;
        ctx.fillRect(playerX - carW / 2, playerY - carH / 2, carW, carH);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(playerX - carW / 2, playerY - carH / 2, carW, carH);

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(playerX - carW * 0.35, playerY - carH * 0.3, carW * 0.7, carH * 0.4);

        // Tail Lights
        ctx.fillStyle = s.keys.down ? '#ef4444' : '#b91c1c';
        ctx.fillRect(playerX - carW / 2 + 4, playerY + carH / 2 - 8, 16, 6);
        ctx.fillRect(playerX + carW / 2 - 20, playerY + carH / 2 - 8, 16, 6);

        // Exhaust Particles
        if (s.speed > 5) {
          s.particles.push({
            x: playerX + (Math.random() - 0.5) * 20,
            y: playerY + carH / 2,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 3 + 2,
            size: Math.random() * 4 + 2,
            color: s.keys.boost ? '#22d3ee' : '#94a3b8',
            life: 1.0
          });
        }

        // Render Particles
        s.particles.forEach((pt, idx) => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life -= 0.05;
          if (pt.life <= 0) {
            s.particles.splice(idx, 1);
          } else {
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = pt.life;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        });

        ctx.restore();

        // Sync React HUD state
        setSpeed(Math.round(s.speed));
        setDistance(Math.round(s.distance));
        setCheckpoints(s.checkpoints);
        setScore(Math.round(s.score));
        setNitro(Math.round(s.nitro));
        setCollisions(s.collisions);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px', background: '#020617', overflow: 'hidden', borderRadius: '24px' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* 3D HUD OVERLAY */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
        {/* Speedometer */}
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Gauge size={14} color="#38bdf8" /> Speed
          </span>
          <strong style={{ fontSize: '1.8rem', color: '#38bdf8', fontWeight: 900 }}>{speed} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>km/h</span></strong>
        </div>

        {/* Score & Checkpoints */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Checkpoints</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#10b981', fontWeight: 900 }}>⛳ {checkpoints}</strong>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(192, 132, 252, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Distance</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#c084fc', fontWeight: 900 }}>{distance} m</strong>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Timer</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#f59e0b', fontWeight: 900 }}>⏱️ {timeLeft}s</strong>
          </div>
        </div>
      </div>

      {/* Nitro Bar */}
      <div style={{ position: 'absolute', bottom: '90px', left: '20px', width: '220px', background: 'rgba(15, 23, 42, 0.85)', padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#fff', fontWeight: 800, marginBottom: '4px' }}>
          <span>NOS NITRO BOOST</span>
          <span style={{ color: '#22d3ee' }}>{nitro}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${nitro}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }} />
        </div>
      </div>

      {/* Mobile Touch Controls */}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onMouseDown={() => stateRef.current.keys.left = true}
            onMouseUp={() => stateRef.current.keys.left = false}
            onTouchStart={() => stateRef.current.keys.left = true}
            onTouchEnd={() => stateRef.current.keys.left = false}
            style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onMouseDown={() => stateRef.current.keys.right = true}
            onMouseUp={() => stateRef.current.keys.right = false}
            onTouchStart={() => stateRef.current.keys.right = true}
            onTouchEnd={() => stateRef.current.keys.right = false}
            style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronRight size={28} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onMouseDown={() => stateRef.current.keys.down = true}
            onMouseUp={() => stateRef.current.keys.down = false}
            onTouchStart={() => stateRef.current.keys.down = true}
            onTouchEnd={() => stateRef.current.keys.down = false}
            style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.3)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowDown size={24} />
          </button>
          <button
            onMouseDown={() => stateRef.current.keys.up = true}
            onMouseUp={() => stateRef.current.keys.up = false}
            onTouchStart={() => stateRef.current.keys.up = true}
            onTouchEnd={() => stateRef.current.keys.up = false}
            style={{ width: '64px', height: '54px', borderRadius: '16px', background: 'linear-gradient(135deg, #0284c7, #2563eb)', border: '1px solid #38bdf8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, cursor: 'pointer' }}
          >
            <ArrowUp size={24} />
          </button>
          <button
            onMouseDown={() => stateRef.current.keys.boost = true}
            onMouseUp={() => stateRef.current.keys.boost = false}
            onTouchStart={() => stateRef.current.keys.boost = true}
            onTouchEnd={() => stateRef.current.keys.boost = false}
            style={{ width: '64px', height: '54px', borderRadius: '16px', background: 'linear-gradient(135deg, #06b6d4, #a855f7)', border: '1px solid #22d3ee', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, cursor: 'pointer' }}
          >
            <Zap size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityRushOpenRoad;
