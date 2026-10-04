import React, { useState, useEffect, useRef } from 'react';
import { Gauge, Trophy, RotateCcw, Zap, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const DownhillBikeRush = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [airtime, setAirtime] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const stateRef = useRef({
    bikeX: 0,
    speed: 0,
    distance: 0,
    airtime: 0,
    score: 0,
    keys: { left: false, right: false, up: false, down: false, jump: false }
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = true;
      if (k === 'arrowright' || k === 'd') keys.right = true;
      if (k === 'arrowup' || k === 'w') keys.up = true;
      if (k === 'arrowdown' || k === 's') keys.down = true;
      if (e.key === ' ') keys.jump = true;
    };

    const handleKeyUp = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = false;
      if (k === 'arrowright' || k === 'd') keys.right = false;
      if (k === 'arrowup' || k === 'w') keys.up = false;
      if (k === 'arrowdown' || k === 's') keys.down = false;
      if (e.key === ' ') keys.jump = false;
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
            accuracy: 92,
            durationSeconds: 60,
            combo: Math.round(s.airtime),
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

        // Downhill acceleration
        s.speed = Math.min(85, s.speed + (s.keys.up ? 1.5 : 0.4));
        if (s.keys.down) s.speed = Math.max(0, s.speed - 2.5);

        if (s.keys.left) s.bikeX = Math.max(-0.8, s.bikeX - 0.025);
        if (s.keys.right) s.bikeX = Math.min(0.8, s.bikeX + 0.025);

        s.distance += (s.speed * 0.05);
        s.score += (s.speed * 0.1);

        if (s.keys.jump) {
          s.airtime += 0.05;
          s.score += 20;
        }

        // Downhill Trail View
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(0, 0, width, height);

        const horizonY = height * 0.4;

        // Trail Path
        ctx.beginPath();
        ctx.moveTo(width / 2 - 25, horizonY);
        ctx.lineTo(width / 2 + 25, horizonY);
        ctx.lineTo(width * 0.85, height);
        ctx.lineTo(width * 0.15, height);
        ctx.fillStyle = '#78350f';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Bike Rider
        const playerX = width / 2 + (s.bikeX * width * 0.35);
        const playerY = height * 0.82;

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(playerX - 12, playerY - 30, 24, 60);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(playerX, playerY - 35, 10, 0, Math.PI * 2);
        ctx.fill();

        setSpeed(Math.round(s.speed));
        setDistance(Math.round(s.distance));
        setAirtime(parseFloat(s.airtime.toFixed(1)));
        setScore(Math.round(s.score));
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px', background: '#064e3b', overflow: 'hidden', borderRadius: '24px' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Downhill Speed</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#38bdf8', fontWeight: 900 }}>🚴 {speed} km/h</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Airtime</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#f59e0b', fontWeight: 900 }}>🚀 {airtime}s</strong>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Score</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#10b981', fontWeight: 900 }}>{score} pts</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownhillBikeRush;
