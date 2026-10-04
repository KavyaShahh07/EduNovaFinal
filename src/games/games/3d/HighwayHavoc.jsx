import React, { useState, useEffect, useRef } from 'react';
import { Gauge, Trophy, RotateCcw, Zap, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const HighwayHavoc = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [nearMisses, setNearMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const stateRef = useRef({
    carX: 0, // -1 to 1 across 4 lanes
    speed: 0,
    score: 0,
    multiplier: 1,
    nearMisses: 0,
    traffic: [],
    keys: { left: false, right: false, up: false, down: false },
    shake: 0
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = true;
      if (k === 'arrowright' || k === 'd') keys.right = true;
      if (k === 'arrowup' || k === 'w') keys.up = true;
      if (k === 'arrowdown' || k === 's') keys.down = true;
    };

    const handleKeyUp = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = false;
      if (k === 'arrowright' || k === 'd') keys.right = false;
      if (k === 'arrowup' || k === 'w') keys.up = false;
      if (k === 'arrowdown' || k === 's') keys.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize Traffic
  useEffect(() => {
    const traffic = [];
    const lanes = [-0.7, -0.25, 0.25, 0.7];
    for (let i = 0; i < 16; i++) {
      traffic.push({
        lane: lanes[Math.floor(Math.random() * lanes.length)],
        z: 300 + i * 120 + Math.random() * 60,
        speed: 25 + Math.random() * 35,
        type: Math.random() > 0.7 ? 'truck' : 'car',
        color: ['#ef4444', '#f59e0b', '#10b981', '#a855f7', '#38bdf8'][Math.floor(Math.random() * 5)],
        scoredNearMiss: false
      });
    }
    stateRef.current.traffic = traffic;
  }, []);

  // Timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const s = stateRef.current;
          onFinish({
            score: Math.round(s.score),
            accuracy: Math.min(100, 70 + s.nearMisses * 5),
            durationSeconds: 60,
            combo: s.nearMisses,
            level: 1
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, onFinish]);

  // Main Render Loop
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

        // Speed physics
        if (s.keys.up) s.speed = Math.min(190, s.speed + 1.8);
        else if (s.keys.down) s.speed = Math.max(0, s.speed - 3.0);
        else s.speed = Math.max(0, s.speed - 0.6);

        // Steering
        if (s.keys.left) s.carX = Math.max(-0.85, s.carX - 0.022);
        if (s.keys.right) s.carX = Math.min(0.85, s.carX + 0.022);

        s.score += (s.speed * 0.15) * s.multiplier;

        if (s.shake > 0) s.shake *= 0.88;

        // Clear & Horizon
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, width, height);

        const horizonY = height * 0.42;

        // 3D Highway Road
        ctx.beginPath();
        ctx.moveTo(width / 2 - 30, horizonY);
        ctx.lineTo(width / 2 + 30, horizonY);
        ctx.lineTo(width * 0.92, height);
        ctx.lineTo(width * 0.08, height);
        ctx.fillStyle = '#111827';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Multi-lane dividers
        const lanesX = [-0.4, 0, 0.4];
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.setLineDash([15, 15]);
        lanesX.forEach(lx => {
          ctx.beginPath();
          ctx.moveTo(width / 2 + lx * 20, horizonY);
          ctx.lineTo(width / 2 + lx * (width * 0.42), height);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // Render Traffic Cars & Trucks
        s.traffic.forEach(t => {
          t.z -= (s.speed - t.speed) * 0.3;
          if (t.z < -40) {
            t.z += 1600;
            const lanes = [-0.7, -0.25, 0.25, 0.7];
            t.lane = lanes[Math.floor(Math.random() * lanes.length)];
            t.scoredNearMiss = false;
          }

          const p = 320 / (t.z + 100);
          if (p > 0 && t.z > 0 && t.z < 1300) {
            const tx = width / 2 + (t.lane * width * 0.42 * (1 - p * 0.2));
            const ty = horizonY + (height * 0.48 * (1 - p));
            const tw = (t.type === 'truck' ? 75 : 60) * p;
            const th = (t.type === 'truck' ? 55 : 35) * p;

            ctx.fillStyle = t.color;
            ctx.fillRect(tx - tw / 2, ty - th, tw, th);

            // Near-miss check
            const dist = Math.abs(s.carX - t.lane);
            if (t.z < 35 && t.z > 0 && dist > 0.18 && dist < 0.35 && !t.scoredNearMiss && s.speed > 80) {
              t.scoredNearMiss = true;
              s.nearMisses += 1;
              s.multiplier = Math.min(5, s.multiplier + 0.5);
              s.score += 300 * s.multiplier;
              soundManager.playCorrect();
            }

            // Collision Check
            if (t.z < 25 && t.z > -10 && dist < 0.18) {
              s.speed = Math.max(20, s.speed - 60);
              s.multiplier = 1;
              s.shake = 15;
              soundManager.playTone(120, 'sawtooth', 0.25);
              t.z += 400;
            }
          }
        });

        // Player Car
        const playerX = width / 2 + (s.carX * width * 0.4);
        const playerY = height * 0.83;
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(playerX - 45, playerY - 24, 90, 48);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(playerX - 45, playerY - 24, 90, 48);

        setSpeed(Math.round(s.speed));
        setScore(Math.round(s.score));
        setMultiplier(s.multiplier);
        setNearMisses(s.nearMisses);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px', background: '#030712', overflow: 'hidden', borderRadius: '24px' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Highway Speed</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#38bdf8', fontWeight: 900 }}>{speed} km/h</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Near Misses</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#f59e0b', fontWeight: 900 }}>🔥 {nearMisses} (x{multiplier})</strong>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Score</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#10b981', fontWeight: 900 }}>{score}</strong>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Timer</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#ef4444', fontWeight: 900 }}>⏱️ {timeLeft}s</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighwayHavoc;
