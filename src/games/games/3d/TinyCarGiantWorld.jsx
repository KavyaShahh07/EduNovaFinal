import React, { useState, useEffect, useRef } from 'react';
import { Compass, Trophy, RotateCcw } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const TinyCarGiantWorld = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [score, setScore] = useState(0);
  const [collectibles, setCollectibles] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const stateRef = useRef({
    carX: 0,
    speed: 0,
    score: 0,
    collectibles: 0,
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
            combo: s.collectibles,
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

        if (s.keys.up) s.speed = Math.min(130, s.speed + 1.6);
        else if (s.keys.down) s.speed = Math.max(0, s.speed - 2.5);
        else s.speed = Math.max(0, s.speed - 0.5);

        if (s.keys.left) s.carX = Math.max(-0.8, s.carX - 0.02);
        if (s.keys.right) s.carX = Math.min(0.8, s.carX + 0.02);

        s.score += (s.speed * 0.1);

        // Giant Classroom/Desk Environment
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, width, height);

        const horizonY = height * 0.45;

        // Desk Surface Track
        ctx.beginPath();
        ctx.moveTo(width / 2 - 40, horizonY);
        ctx.lineTo(width / 2 + 40, horizonY);
        ctx.lineTo(width * 0.9, height);
        ctx.lineTo(width * 0.1, height);
        ctx.fillStyle = '#7c2d12';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Giant Objects: Textbooks, Pencils, Soda Cans
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(100, horizonY - 80, 160, 120); // Giant Physics Textbook
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText('PHYSICS VOL I', 120, horizonY - 20);

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(width - 240, horizonY - 110, 80, 140); // Giant Soda Can

        // Tiny Toy Car
        const playerX = width / 2 + (s.carX * width * 0.35);
        const playerY = height * 0.82;

        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(playerX - 25, playerY - 15, 50, 30);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(playerX - 25, playerY - 15, 50, 30);

        setCollectibles(s.collectibles);
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
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Tiny Car Score</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#f43f5e', fontWeight: 900 }}>🏎️ {score} pts</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Timer</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#38bdf8', fontWeight: 900 }}>⏱️ {timeLeft}s</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TinyCarGiantWorld;
