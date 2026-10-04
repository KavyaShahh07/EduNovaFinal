import React, { useState, useEffect, useRef } from 'react';
import { Gauge, Trophy, RotateCcw, ShieldAlert } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const CrashTestChallenge = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [impactSpeed, setImpactSpeed] = useState(0);
  const [stoppingDist, setStoppingDist] = useState(0);
  const [durability, setDurability] = useState(100);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const stateRef = useRef({
    carX: 120,
    speed: 0,
    durability: 100,
    stoppingDist: 0,
    score: 0,
    hasCrashed: false,
    keys: { up: false, down: false }
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') keys.up = true;
      if (k === 'arrowdown' || k === 's') keys.down = true;
    };

    const handleKeyUp = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
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
            accuracy: s.durability,
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

        if (s.keys.up && !s.hasCrashed) s.speed = Math.min(160, s.speed + 2.0);
        else if (s.keys.down) s.speed = Math.max(0, s.speed - 4.0);
        else s.speed = Math.max(0, s.speed - 0.5);

        if (!s.hasCrashed) {
          s.carX += s.speed * 0.12;
        }

        // Check Impact Barrier
        const barrierX = width - 150;
        if (s.carX >= barrierX - 40 && !s.hasCrashed) {
          s.hasCrashed = true;
          const damage = Math.round(s.speed * 0.5);
          s.durability = Math.max(0, 100 - damage);
          s.score = Math.round(s.speed * 12);
          soundManager.playTone(100, 'sawtooth', 0.3);
        }

        // Render Facility
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Test Track Lane
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, height / 2 - 40, width, 120);

        // Crash Barrier
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(barrierX, height / 2 - 60, 30, 160);

        // Vehicle
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(s.carX - 35, height / 2 - 20, 70, 40);

        setImpactSpeed(Math.round(s.speed));
        setDurability(s.durability);
        setScore(s.score);
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
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Durability Meter</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#ef4444', fontWeight: 900 }}>🛡️ {durability}%</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Impact Speed</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#38bdf8', fontWeight: 900 }}>⚡ {impactSpeed} km/h</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashTestChallenge;
