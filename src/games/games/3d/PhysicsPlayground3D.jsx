import React, { useState, useEffect, useRef } from 'react';
import { Compass, Trophy, RotateCcw } from 'lucide-react';
import { soundManager } from '../../shared/SoundManager';

export const PhysicsPlayground3D = ({
  isPaused = false,
  onFinish = () => {}
}) => {
  const canvasRef = useRef(null);

  const [gravity, setGravity] = useState(9.8);
  const [objectsCount, setObjectsCount] = useState(8);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const stateRef = useRef({
    objects: [],
    score: 0,
    gravity: 9.8
  });

  useEffect(() => {
    // Generate initial sandbox physics bodies
    const objects = [];
    for (let i = 0; i < 10; i++) {
      objects.push({
        x: 100 + i * 70,
        y: 100 + Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2,
        radius: 15 + Math.random() * 20,
        color: ['#06b6d4', '#10b981', '#f59e0b', '#c084fc', '#f43f5e'][i % 5]
      });
    }
    stateRef.current.objects = objects;
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
            score: Math.round(s.score + 500),
            accuracy: 100,
            durationSeconds: 60,
            combo: s.objects.length,
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

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Ground & Ramps
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, height - 60, width, 60);

        // Update & Render Physics Objects
        s.objects.forEach(obj => {
          obj.vy += (s.gravity * 0.05);
          obj.x += obj.vx;
          obj.y += obj.vy;

          // Bounce off floor
          if (obj.y + obj.radius > height - 60) {
            obj.y = height - 60 - obj.radius;
            obj.vy *= -0.75;
            s.score += 10;
          }

          // Bounce off walls
          if (obj.x - obj.radius < 0 || obj.x + obj.radius > width) {
            obj.vx *= -0.85;
            obj.x = Math.max(obj.radius, Math.min(width - obj.radius, obj.x));
          }

          ctx.fillStyle = obj.color;
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
        });

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
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '16px', padding: '12px 20px', color: '#fff' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Physics Energy</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#06b6d4', fontWeight: 900 }}>🧪 {score} pts</strong>
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

export default PhysicsPlayground3D;
