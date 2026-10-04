import React, { useState, useEffect, useRef } from 'react';
import { Flame, Trophy, RotateCcw, Zap } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const WobblyWheelChaos = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [score, setScore] = useState(0);
  const [bounciness, setBounciness] = useState(90);
  const [flips, setFlips] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const stateRef = useRef({
    x: 100,
    y: 350,
    vx: 0,
    vy: 0,
    angle: 0,
    wobblyBounce: 0,
    flips: 0,
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
            accuracy: 95,
            durationSeconds: 60,
            combo: s.flips,
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

        if (s.keys.up) s.vx = Math.min(14, s.vx + 0.4);
        else if (s.keys.down) s.vx = Math.max(-4, s.vx - 0.3);
        else s.vx *= 0.95;

        if (s.keys.left) s.angle -= 0.08;
        if (s.keys.right) s.angle += 0.08;

        s.wobblyBounce = Math.sin(Date.now() * 0.02) * 12;
        s.score += Math.abs(s.vx) * 2;

        if (Math.abs(s.angle) > Math.PI * 1.5) {
          s.flips += 1;
          s.angle = 0;
          s.score += 300;
          soundManager.playCorrect();
        }

        s.x = (s.x + s.vx) % width;
        if (s.x < 0) s.x += width;

        // Bumpy Wobbly Hills
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 30) {
          const y = height - 100 + Math.sin(x * 0.03) * 35;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.fill();

        // Wobbly Vehicle
        ctx.save();
        ctx.translate(s.x, height - 120 + s.wobblyBounce);
        ctx.rotate(s.angle);

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-30, -20, 60, 40);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(-30, -20, 60, 40);

        // Giant Jelly Wheels
        const wheelY = 15 + Math.sin(Date.now() * 0.03) * 6;
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(-20, wheelY, 16, 0, Math.PI * 2);
        ctx.arc(20, wheelY, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        setScore(Math.round(s.score));
        setFlips(s.flips);
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
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Wobbly Chaos Score</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#f59e0b', fontWeight: 900 }}>{score} pts</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(236, 72, 153, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Jelly Flips</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#ec4899', fontWeight: 900 }}>🌀 {flips}</strong>
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

export default WobblyWheelChaos;
