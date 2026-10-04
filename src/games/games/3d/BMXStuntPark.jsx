import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const BMXStuntPark = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [trickScore, setTrickScore] = useState(0);
  const [currentTrick, setCurrentTrick] = useState('Superflip');
  const [multiplier, setMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);

  const stateRef = useRef({
    x: 200,
    y: 350,
    vx: 0,
    vy: 0,
    angle: 0,
    isAirborne: false,
    trickScore: 0,
    multiplier: 1,
    keys: { left: false, right: false, up: false, down: false, trick: false }
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = true;
      if (k === 'arrowright' || k === 'd') keys.right = true;
      if (k === 'arrowup' || k === 'w') keys.up = true;
      if (k === 'arrowdown' || k === 's') keys.down = true;
      if (e.key === ' ' || k === 'x') keys.trick = true;
    };

    const handleKeyUp = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = false;
      if (k === 'arrowright' || k === 'd') keys.right = false;
      if (k === 'arrowup' || k === 'w') keys.up = false;
      if (k === 'arrowdown' || k === 's') keys.down = false;
      if (e.key === ' ' || k === 'x') keys.trick = false;
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
            score: Math.round(s.trickScore),
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
        else s.vx *= 0.96;

        if (s.keys.left) s.x -= 4;
        if (s.keys.right) s.x += 4;

        if (s.keys.trick) {
          s.multiplier = Math.min(5, s.multiplier + 0.1);
          s.trickScore += 50 * s.multiplier;
          const tricks = ['Tailwhip 360', 'Backflip Spin', 'Barspin 180', 'Superman Seatgrab'];
          setCurrentTrick(tricks[Math.floor(Math.random() * tricks.length)]);
          soundManager.playCorrect();
        }

        s.x = Math.max(50, Math.min(width - 50, s.x));

        // 3D Skatepark Ramp Environment
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, width, height);

        // Half-pipe Ramps
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.arc(150, 200, 150, 0, Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(width - 150, 200, 150, 0, Math.PI);
        ctx.fill();

        // Ground
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 420, width, height - 420);

        // BMX Rider
        ctx.save();
        ctx.translate(s.x, 380);
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(-15, -20, 30, 40);
        ctx.restore();

        setTrickScore(Math.round(s.trickScore));
        setMultiplier(parseFloat(s.multiplier.toFixed(1)));
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
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>BMX Trick Score</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#a855f7', fontWeight: 900 }}>{trickScore} pts</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Combo Multiplier</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#f59e0b', fontWeight: 900 }}>✨ x{multiplier}</strong>
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

export default BMXStuntPark;
