import React, { useState, useEffect, useRef } from 'react';
import { Zap, Trophy, RotateCcw } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const NeonTunnelRacer = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const stateRef = useRef({
    tunnelAngle: 0,
    speed: 120,
    score: 0,
    barriers: [],
    keys: { left: false, right: false }
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = true;
      if (k === 'arrowright' || k === 'd') keys.right = true;
    };

    const handleKeyUp = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = false;
      if (k === 'arrowright' || k === 'd') keys.right = false;
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
            accuracy: 98,
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

        if (s.keys.left) s.tunnelAngle -= 0.05;
        if (s.keys.right) s.tunnelAngle += 0.05;

        s.score += 10;

        // 3D Neon Tunnel Background
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;

        // Render Neon Tunnel Rings
        for (let r = 1; r <= 8; r++) {
          const radius = (r * 35 + (Date.now() * 0.1) % 35);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsl(${(r * 30 + Date.now() * 0.1) % 360}, 100%, 60%)`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Tunnel Player Ship
        const shipRadius = 130;
        const shipX = centerX + Math.cos(s.tunnelAngle) * shipRadius;
        const shipY = centerY + Math.sin(s.tunnelAngle) * shipRadius;

        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(shipX, shipY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        setSpeed(s.speed);
        setScore(Math.round(s.score));
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px', background: '#020617', overflow: 'hidden', borderRadius: '24px' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(34, 211, 238, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Neon Speed</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#22d3ee', fontWeight: 900 }}>🚀 {speed} km/h</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Tunnel Score</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#10b981', fontWeight: 900 }}>{score} pts</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeonTunnelRacer;
