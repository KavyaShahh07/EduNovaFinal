import React, { useState, useEffect, useRef } from 'react';
import { Flame, Trophy, RotateCcw } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const EscapeGiantBoulder = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [distance, setDistance] = useState(0);
  const [boulderGap, setBoulderGap] = useState(45);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const stateRef = useRef({
    carX: 0,
    speed: 0,
    boulderGap: 45,
    distance: 0,
    score: 0,
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
            accuracy: 96,
            durationSeconds: 60,
            combo: 1,
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

        if (s.keys.up) s.speed = Math.min(150, s.speed + 1.8);
        else if (s.keys.down) s.speed = Math.max(0, s.speed - 2.5);
        else s.speed = Math.max(0, s.speed - 0.5);

        if (s.keys.left) s.carX = Math.max(-0.8, s.carX - 0.02);
        if (s.keys.right) s.carX = Math.min(0.8, s.carX + 0.02);

        s.distance += (s.speed * 0.08);
        s.score += (s.speed * 0.12);

        // Boulder Gap Physics
        const speedDelta = s.speed - 90;
        s.boulderGap = Math.max(5, Math.min(80, s.boulderGap + speedDelta * 0.02));

        // Canyon Background
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, width, height);

        const horizonY = height * 0.45;

        // Canyon Path
        ctx.beginPath();
        ctx.moveTo(width / 2 - 30, horizonY);
        ctx.lineTo(width / 2 + 30, horizonY);
        ctx.lineTo(width * 0.88, height);
        ctx.lineTo(width * 0.12, height);
        ctx.fillStyle = '#7c2d12';
        ctx.fill();

        // Giant Rolling Boulder Behind
        const boulderY = horizonY + (100 - s.boulderGap) * 3;
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(width / 2, boulderY, 55, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Player Escaping Vehicle
        const playerX = width / 2 + (s.carX * width * 0.35);
        const playerY = height * 0.82;

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(playerX - 22, playerY - 15, 44, 30);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(playerX - 22, playerY - 15, 44, 30);

        setDistance(Math.round(s.distance));
        setBoulderGap(Math.round(s.boulderGap));
        setScore(Math.round(s.score));
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px', background: '#1e1b4b', overflow: 'hidden', borderRadius: '24px' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Boulder Gap Distance</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#f59e0b', fontWeight: 900 }}>🪨 {boulderGap} m</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Distance Run</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#10b981', fontWeight: 900 }}>{distance} m</strong>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Timer</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#38bdf8', fontWeight: 900 }}>⏱️ {timeLeft}s</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscapeGiantBoulder;
