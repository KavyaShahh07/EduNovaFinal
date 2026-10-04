import React, { useState, useEffect, useRef } from 'react';
import { Gauge, Trophy, Zap, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const MotorcycleHighwayRacer = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [speed, setSpeed] = useState(0);
  const [overtakes, setOvertakes] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const stateRef = useRef({
    bikeX: 0,
    speed: 0,
    score: 0,
    overtakes: 0,
    traffic: [],
    keys: { left: false, right: false, up: false, down: false }
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
    for (let i = 0; i < 12; i++) {
      traffic.push({
        lane: (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.45),
        z: 200 + i * 140 + Math.random() * 60,
        speed: 30 + Math.random() * 30,
        color: ['#ef4444', '#f59e0b', '#10b981', '#a855f7'][Math.floor(Math.random() * 4)]
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
            accuracy: 94,
            durationSeconds: 60,
            combo: s.overtakes,
            level: 1
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, onFinish]);

  // Render Loop
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

        if (s.keys.up) s.speed = Math.min(220, s.speed + 2.2);
        else if (s.keys.down) s.speed = Math.max(0, s.speed - 3.5);
        else s.speed = Math.max(0, s.speed - 0.7);

        if (s.keys.left) s.bikeX = Math.max(-0.85, s.bikeX - 0.025);
        if (s.keys.right) s.bikeX = Math.min(0.85, s.bikeX + 0.025);

        s.score += (s.speed * 0.2);

        // Highway Background
        ctx.fillStyle = '#050b14';
        ctx.fillRect(0, 0, width, height);

        const horizonY = height * 0.42;

        // Road
        ctx.beginPath();
        ctx.moveTo(width / 2 - 30, horizonY);
        ctx.lineTo(width / 2 + 30, horizonY);
        ctx.lineTo(width * 0.9, height);
        ctx.lineTo(width * 0.1, height);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Traffic
        s.traffic.forEach(t => {
          t.z -= (s.speed - t.speed) * 0.3;
          if (t.z < -40) {
            t.z += 1500;
            t.lane = (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.45);
            s.overtakes += 1;
            soundManager.playCorrect();
          }

          const p = 300 / (t.z + 100);
          if (p > 0 && t.z > 0 && t.z < 1200) {
            const tx = width / 2 + (t.lane * width * 0.4 * (1 - p * 0.2));
            const ty = horizonY + (height * 0.45 * (1 - p));
            const tw = 55 * p;
            const th = 35 * p;

            ctx.fillStyle = t.color;
            ctx.fillRect(tx - tw / 2, ty - th, tw, th);
          }
        });

        // Player Superbike
        const playerX = width / 2 + (s.bikeX * width * 0.38);
        const playerY = height * 0.83;

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(playerX - 14, playerY - 30, 28, 60);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(playerX - 6, playerY - 15, 12, 20);

        setSpeed(Math.round(s.speed));
        setOvertakes(s.overtakes);
        setScore(Math.round(s.score));
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px', background: '#050b14', overflow: 'hidden', borderRadius: '24px' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Superbike Speed</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#38bdf8', fontWeight: 900 }}>🏍️ {speed} km/h</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Overtakes</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#10b981', fontWeight: 900 }}>⚡ {overtakes}</strong>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Timer</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#f59e0b', fontWeight: 900 }}>⏱️ {timeLeft}s</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorcycleHighwayRacer;
