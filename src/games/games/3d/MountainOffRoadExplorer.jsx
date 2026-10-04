import React, { useState, useEffect, useRef } from 'react';
import { Compass, Trophy, RotateCcw } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const MountainOffRoadExplorer = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [elevation, setElevation] = useState(120);
  const [traction, setTraction] = useState(85);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(75);

  const stateRef = useRef({
    carX: 0,
    speed: 0,
    elevation: 120,
    traction: 85,
    score: 0,
    terrain: [],
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
            accuracy: 90,
            durationSeconds: 75,
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

        if (s.keys.up) s.speed = Math.min(110, s.speed + 1.2);
        else if (s.keys.down) s.speed = Math.max(0, s.speed - 2.0);
        else s.speed = Math.max(0, s.speed - 0.5);

        if (s.keys.left) s.carX = Math.max(-0.75, s.carX - 0.02);
        if (s.keys.right) s.carX = Math.min(0.75, s.carX + 0.02);

        s.elevation += (s.speed * 0.04);
        s.score += (s.speed * 0.12);

        // Mountain Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        const horizonY = height * 0.5;

        // Mountain Silhouettes
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(200, horizonY - 120);
        ctx.lineTo(450, horizonY);
        ctx.lineTo(700, horizonY - 180);
        ctx.lineTo(width, horizonY);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fill();

        // 3D Mountain Dirt Track
        ctx.beginPath();
        ctx.moveTo(width / 2 - 35, horizonY);
        ctx.lineTo(width / 2 + 35, horizonY);
        ctx.lineTo(width * 0.88, height);
        ctx.lineTo(width * 0.12, height);
        ctx.fillStyle = '#78350f';
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Off-Road 4x4 Vehicle
        const playerX = width / 2 + (s.carX * width * 0.38);
        const playerY = height * 0.82;

        ctx.fillStyle = '#10b981';
        ctx.fillRect(playerX - 42, playerY - 22, 84, 44);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(playerX - 42, playerY - 22, 84, 44);

        setElevation(Math.round(s.elevation));
        setScore(Math.round(s.score));
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px', background: '#0f172a', overflow: 'hidden', borderRadius: '24px' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Elevation</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#10b981', fontWeight: 900 }}>⛰️ {elevation} m</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Traction Grip</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#f59e0b', fontWeight: 900 }}>{traction}%</strong>
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

export default MountainOffRoadExplorer;
