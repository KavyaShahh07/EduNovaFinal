import React, { useState, useEffect, useRef } from 'react';
import { Flame, Gauge, Trophy, RotateCcw, Sparkles } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const DriftKingArena = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [driftScore, setDriftScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [isDrifting, setIsDrifting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const stateRef = useRef({
    x: 400,
    y: 300,
    angle: 0,
    speed: 0,
    driftScore: 0,
    multiplier: 1,
    isDrifting: false,
    skidMarks: [],
    smoke: [],
    keys: { left: false, right: false, up: false, down: false, handbrake: false }
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = true;
      if (k === 'arrowright' || k === 'd') keys.right = true;
      if (k === 'arrowup' || k === 'w') keys.up = true;
      if (k === 'arrowdown' || k === 's') keys.down = true;
      if (e.key === ' ' || k === 'shift') keys.handbrake = true;
    };

    const handleKeyUp = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = false;
      if (k === 'arrowright' || k === 'd') keys.right = false;
      if (k === 'arrowup' || k === 'w') keys.up = false;
      if (k === 'arrowdown' || k === 's') keys.down = false;
      if (e.key === ' ' || k === 'shift') keys.handbrake = false;
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
            score: Math.round(s.driftScore),
            accuracy: 95,
            durationSeconds: 60,
            combo: Math.round(s.multiplier),
            level: 1
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, onFinish]);

  // 60 FPS Loop
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

        // Acceleration
        if (s.keys.up) s.speed = Math.min(12, s.speed + 0.25);
        else if (s.keys.down) s.speed = Math.max(-4, s.speed - 0.2);
        else s.speed *= 0.96;

        // Steering
        if (s.keys.left) s.angle -= 0.06;
        if (s.keys.right) s.angle += 0.06;

        // Drift check
        const drifting = (s.keys.handbrake || Math.abs(s.speed) > 6) && (s.keys.left || s.keys.right);
        s.isDrifting = drifting;

        if (drifting) {
          s.multiplier = Math.min(6, s.multiplier + 0.02);
          s.driftScore += 15 * s.multiplier;

          // Skid marks & smoke
          s.skidMarks.push({ x: s.x, y: s.y, alpha: 1.0 });
          s.smoke.push({
            x: s.x + (Math.random() - 0.5) * 15,
            y: s.y + (Math.random() - 0.5) * 15,
            size: Math.random() * 8 + 4,
            alpha: 0.8
          });

          if (Math.random() > 0.8) soundManager.playTone(400, 'sawtooth', 0.05);
        } else {
          s.multiplier = Math.max(1, s.multiplier - 0.05);
        }

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        // Keep inside bounds
        s.x = Math.max(50, Math.min(width - 50, s.x));
        s.y = Math.max(50, Math.min(height - 50, s.y));

        // Background Arena Grid
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Circular Drift Track Layout
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 210, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 100, 0, Math.PI * 2);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Render Skid Marks
        s.skidMarks.forEach((sm, idx) => {
          sm.alpha -= 0.005;
          if (sm.alpha <= 0) s.skidMarks.splice(idx, 1);
          else {
            ctx.fillStyle = `rgba(15, 23, 42, ${sm.alpha})`;
            ctx.fillRect(sm.x, sm.y, 4, 4);
          }
        });

        // Render Tire Smoke
        s.smoke.forEach((sm, idx) => {
          sm.alpha -= 0.04;
          sm.size += 0.4;
          if (sm.alpha <= 0) s.smoke.splice(idx, 1);
          else {
            ctx.fillStyle = `rgba(241, 245, 249, ${sm.alpha})`;
            ctx.beginPath();
            ctx.arc(sm.x, sm.y, sm.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Render Drift Car
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        ctx.fillStyle = '#ec4899';
        ctx.fillRect(-20, -10, 40, 20);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(-20, -10, 40, 20);

        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-5, -7, 14, 14);

        ctx.restore();

        setDriftScore(Math.round(s.driftScore));
        setMultiplier(parseFloat(s.multiplier.toFixed(1)));
        setIsDrifting(s.isDrifting);
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
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(236, 72, 153, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Drift Score</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#ec4899', fontWeight: 900 }}>{driftScore} pts</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Drift Combo</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#f59e0b', fontWeight: 900 }}>⚡ x{multiplier}</strong>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Time Left</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#38bdf8', fontWeight: 900 }}>⏱️ {timeLeft}s</strong>
          </div>
        </div>
      </div>

      {isDrifting && (
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', padding: '10px 24px', borderRadius: '999px', color: '#fff', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '1px', boxShadow: '0 0 20px rgba(236, 72, 153, 0.6)' }}>
          🔥 DRIFTING x{multiplier}!
        </div>
      )}
    </div>
  );
};

export default DriftKingArena;
