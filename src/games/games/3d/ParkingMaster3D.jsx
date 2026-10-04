import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, RotateCcw, Camera, Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const ParkingMaster3D = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [accuracy, setAccuracy] = useState(100);
  const [collisions, setCollisions] = useState(0);
  const [isParked, setIsParked] = useState(false);
  const [isReverse, setIsReverse] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);

  const stateRef = useRef({
    x: 180,
    y: 420,
    angle: -Math.PI / 2,
    speed: 0,
    isReverse: false,
    collisions: 0,
    score: 0,
    isParked: false,
    bay: { x: 620, y: 160, w: 110, h: 180 },
    cones: [
      { x: 450, y: 250 },
      { x: 450, y: 350 },
      { x: 300, y: 200 },
      { x: 550, y: 120 }
    ],
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
      if (k === 'r') setIsReverse(prev => !prev);
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
        if (prev <= 1 || stateRef.current.isParked) {
          clearInterval(timer);
          const s = stateRef.current;
          onFinish({
            score: Math.round(s.score),
            accuracy: Math.max(40, 100 - s.collisions * 15),
            durationSeconds: 90 - prev,
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

        // Drive logic
        const moveDir = isReverse ? -1 : 1;
        if (s.keys.up) s.speed = Math.min(3.5, s.speed + 0.15);
        else if (s.keys.down) s.speed = Math.max(0, s.speed - 0.2);
        else s.speed *= 0.92;

        if (s.keys.left) s.angle -= 0.04 * (s.speed / 3.5);
        if (s.keys.right) s.angle += 0.04 * (s.speed / 3.5);

        s.x += Math.cos(s.angle) * s.speed * moveDir;
        s.y += Math.sin(s.angle) * s.speed * moveDir;

        // Clear Garage Scene
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, width, height);

        // Parking Bay Lines (Target Spot)
        const bay = s.bay;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.fillRect(bay.x, bay.y, bay.w, bay.h);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 10]);
        ctx.strokeRect(bay.x, bay.y, bay.w, bay.h);
        ctx.setLineDash([]);

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillText('PARKING BAY #01', bay.x + 10, bay.y + 30);

        // Cones / Obstacles
        s.cones.forEach(c => {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
          ctx.fill();

          // Distance check for collision
          const dx = s.x - c.x;
          const dy = s.y - c.y;
          if (Math.sqrt(dx * dx + dy * dy) < 26) {
            s.collisions += 1;
            s.speed = 0;
            soundManager.playTone(180, 'sawtooth', 0.15);
            s.x -= Math.cos(s.angle) * 15;
            s.y -= Math.sin(s.angle) * 15;
          }
        });

        // Car Render
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-22, -12, 44, 24);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(-22, -12, 44, 24);

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(6, -9, 10, 18);

        ctx.restore();

        // Parking Precision Check
        const inBayX = s.x > bay.x && s.x < bay.x + bay.w;
        const inBayY = s.y > bay.y && s.y < bay.y + bay.h;
        if (inBayX && inBayY && s.speed < 0.2) {
          s.isParked = true;
          s.score = Math.max(200, 1000 - s.collisions * 100);
          soundManager.playCorrect();
        }

        setAccuracy(Math.max(40, 100 - s.collisions * 15));
        setCollisions(s.collisions);
        setIsParked(s.isParked);
        setScore(s.score);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, isReverse]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px', background: '#1e293b', overflow: 'hidden', borderRadius: '24px' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Accuracy</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#10b981', fontWeight: 900 }}>{accuracy}%</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Collisions</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: '#ef4444', fontWeight: 900 }}>💥 {collisions}</strong>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', padding: '12px 18px', color: '#fff', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Gear</span>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: isReverse ? '#f59e0b' : '#38bdf8', fontWeight: 900 }}>{isReverse ? 'R (Reverse)' : 'D (Drive)'}</strong>
          </div>
        </div>
      </div>

      {isParked && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: '16px' }}>
          <ShieldCheck size={56} color="#10b981" />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: '#10b981' }}>PERFECT PARKING MASTERED!</h2>
          <p style={{ color: '#cbd5e1' }}>Accuracy: {accuracy}% • Score: {score} pts</p>
        </div>
      )}
    </div>
  );
};

export default ParkingMaster3D;
