import React, { useState, useEffect, useRef } from 'react';
import { Package, Trophy, RotateCcw } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const RagdollDeliveryDisaster = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [packages, setPackages] = useState(5);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const stateRef = useRef({
    x: 150,
    y: 350,
    vx: 0,
    vy: 0,
    packages: 5,
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
            accuracy: s.packages * 20,
            durationSeconds: 60,
            combo: s.packages,
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

        if (s.keys.up) s.vx = Math.min(10, s.vx + 0.3);
        else if (s.keys.down) s.vx = Math.max(-2, s.vx - 0.2);
        else s.vx *= 0.95;

        if (s.keys.left) s.x -= 3;
        if (s.keys.right) s.x += 3;

        s.x = (s.x + s.vx) % width;
        if (s.x < 0) s.x += width;
        s.score += Math.abs(s.vx);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Bouncy Obstacle Platform
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, height - 70, width, 70);

        // Ragdoll Character
        ctx.save();
        ctx.translate(s.x, height - 120);

        // Head
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(0, -30, 14, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-10, -15, 20, 30);

        // Stacked Packages on head!
        for (let p = 0; p < s.packages; p++) {
          ctx.fillStyle = '#10b981';
          ctx.fillRect(-12, -45 - p * 14, 24, 12);
        }

        ctx.restore();

        setPackages(s.packages);
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
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Fragile Packages</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#10b981', fontWeight: 900 }}>📦 {packages} Intact</strong>
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

export default RagdollDeliveryDisaster;
