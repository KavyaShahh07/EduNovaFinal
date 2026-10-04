import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Trophy, Zap, Compass, Sparkles } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const ImpossibleStuntGarage = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [airtime, setAirtime] = useState(0);
  const [stuntScore, setStuntScore] = useState(0);
  const [checkpoint, setCheckpoint] = useState(1);
  const [timeLeft, setTimeLeft] = useState(70);

  const stateRef = useRef({
    carX: 0,
    carY: 0,
    speed: 0,
    airtime: 0,
    isAirborne: false,
    stuntScore: 0,
    checkpoint: 1,
    ramps: [
      { z: 300, height: 40, width: 80 },
      { z: 900, height: 60, width: 90 },
      { z: 1600, height: 80, width: 100 }
    ],
    keys: { left: false, right: false, up: false, down: false, boost: false }
  });

  const resetVehicle = () => {
    const s = stateRef.current;
    s.carX = 0;
    s.speed = 0;
    s.isAirborne = false;
    soundManager.playTone(300, 'sine', 0.1);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = stateRef.current.keys;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.left = true;
      if (k === 'arrowright' || k === 'd') keys.right = true;
      if (k === 'arrowup' || k === 'w') keys.up = true;
      if (k === 'arrowdown' || k === 's') keys.down = true;
      if (k === 'r') resetVehicle();
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
            score: Math.round(s.stuntScore),
            accuracy: 90,
            durationSeconds: 70,
            combo: s.checkpoint,
            level: s.checkpoint
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, onFinish]);

  // 60 FPS Render
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

        if (s.keys.up) s.speed = Math.min(170, s.speed + 1.5);
        else if (s.keys.down) s.speed = Math.max(0, s.speed - 2.0);
        else s.speed = Math.max(0, s.speed - 0.4);

        if (s.keys.left) s.carX = Math.max(-0.8, s.carX - 0.02);
        if (s.keys.right) s.carX = Math.min(0.8, s.carX + 0.02);

        // Sky background
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);

        const horizonY = height * 0.48;

        // Elevated Sky Track
        ctx.beginPath();
        ctx.moveTo(width / 2 - 45, horizonY);
        ctx.lineTo(width / 2 + 45, horizonY);
        ctx.lineTo(width * 0.85, height);
        ctx.lineTo(width * 0.15, height);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 3D Stunt Ramps
        s.ramps.forEach(r => {
          r.z -= s.speed * 0.3;
          if (r.z < -40) {
            r.z += 2200;
            s.checkpoint += 1;
            s.stuntScore += 400;
            soundManager.playCorrect();
          }

          const p = 300 / (r.z + 100);
          if (p > 0 && r.z > 0 && r.z < 1200) {
            const rx = width / 2;
            const ry = horizonY + (height * 0.4 * (1 - p));
            const rw = r.width * p * 2.5;
            const rh = r.height * p * 2;

            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(rx - rw / 2, ry);
            ctx.lineTo(rx + rw / 2, ry);
            ctx.lineTo(rx, ry - rh);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            // Ramp Airtime Launch
            if (r.z < 30 && r.z > -10 && s.speed > 80) {
              s.isAirborne = true;
              s.airtime += 0.1;
              s.stuntScore += 50;
            }
          }
        });

        // Player Car
        const playerX = width / 2 + (s.carX * width * 0.35);
        const playerY = height * 0.82 - (s.isAirborne ? 30 : 0);

        ctx.fillStyle = '#c084fc';
        ctx.fillRect(playerX - 40, playerY - 20, 80, 40);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(playerX - 40, playerY - 20, 80, 40);

        setAirtime(parseFloat(s.airtime.toFixed(1)));
        setStuntScore(Math.round(s.stuntScore));
        setCheckpoint(s.checkpoint);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px', background: '#090d16', overflow: 'hidden', borderRadius: '24px' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(192, 132, 252, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Stunt Score</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#c084fc', fontWeight: 900 }}>{stuntScore} pts</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Airtime</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#f59e0b', fontWeight: 900 }}>🚀 {airtime}s</strong>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Checkpoint</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#10b981', fontWeight: 900 }}>🚩 #{checkpoint}</strong>
          </div>
        </div>
      </div>

      <button
        onClick={resetVehicle}
        style={{ position: 'absolute', bottom: '25px', right: '25px', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid #ef4444', color: '#fff', padding: '10px 18px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <RotateCcw size={16} /> Recovery Vehicle (R)
      </button>
    </div>
  );
};

export default ImpossibleStuntGarage;
