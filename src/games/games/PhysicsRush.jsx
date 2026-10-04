import React, { useState, useEffect, useRef } from 'react';
import { Compass, Zap, Flame, Target, Play, RotateCcw, Award } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

const PHYSICS_LEVELS = [
  {
    level: 1,
    title: 'Earth Orbit Trajectory',
    targetDistance: 50, // meters (represented on 0-100 canvas scale)
    gravity: 9.8,
    hint: 'Range R = (v² · sin(2θ)) / g. At 45°, sin(90°) = 1. If v ≈ 22.1 m/s, R ≈ 50m.',
    challengeQ: 'To maximize projectile range under uniform gravity, the optimal launch angle is:',
    challengeOpts: ['45°', '30°', '60°', '90°'],
    challengeAns: '45°'
  },
  {
    level: 2,
    title: 'Lunar Low-Gravity Slingshot',
    targetDistance: 75,
    gravity: 1.62,
    hint: 'Moon gravity is ~1.62 m/s² (1/6th Earth). Less launch velocity is required.',
    challengeQ: 'If gravitational acceleration g decreases by a factor of 6, maximum range R:',
    challengeOpts: ['Increases by 6x', 'Decreases by 6x', 'Remains unchanged', 'Increases by 36x'],
    challengeAns: 'Increases by 6x'
  },
  {
    level: 3,
    title: 'Martian Crater Leap',
    targetDistance: 60,
    gravity: 3.71,
    hint: 'Mars gravity is 3.71 m/s².',
    challengeQ: 'At the apex (highest point) of parabolic projectile flight, the vertical velocity is:',
    challengeOpts: ['0 m/s', 'Maximum', 'Equal to horizontal velocity', 'Negative'],
    challengeAns: '0 m/s'
  }
];

export const PhysicsRush = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(22);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);
  const [projectilePos, setProjectilePos] = useState({ x: 5, y: 80 });
  const [launchResult, setLaunchResult] = useState(null); // 'HIT' | 'SHORT' | 'OVERSHOT'
  const [solvedPreChallenge, setSolvedPreChallenge] = useState(false);

  const currentLevel = PHYSICS_LEVELS[levelIdx];
  const animFrameRef = useRef(null);

  useEffect(() => {
    onChallengeChange({ question: `${currentLevel.title}: ${currentLevel.challengeQ}` });
    setSolvedPreChallenge(false);
    setLaunchResult(null);
    setProjectilePos({ x: 5, y: 80 });
  }, [levelIdx]);

  const handlePreChallenge = (opt) => {
    const isCorrect = opt === currentLevel.challengeAns;
    if (isCorrect) {
      soundManager.playCorrect();
      setScore(prev => prev + 100);
      setCombo(prev => prev + 1);
      setSolvedPreChallenge(true);
      onAttempt(null);
    } else {
      soundManager.playWrong();
      setCombo(0);
      onAttempt({
        question: currentLevel.challengeQ,
        userAnswer: opt,
        correctAnswer: currentLevel.challengeAns
      });
    }
  };

  const handleLaunch = () => {
    if (isLaunching || isPaused) return;

    soundManager.playLaser();
    setIsLaunching(true);
    setLaunchResult(null);

    const rad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);
    const g = currentLevel.gravity;

    let t = 0;
    const startX = 5;
    const startY = 80;

    const simulate = () => {
      t += 0.05;
      const currentX = startX + (vx * t * 1.8);
      const currentY = startY - ((vy * t - 0.5 * g * t * t) * 1.8);

      if (currentY >= 80 && t > 0.2) {
        // Landed!
        const finalX = currentX;
        setProjectilePos({ x: Math.min(95, Math.max(5, finalX)), y: 80 });
        setIsLaunching(false);

        const targetX = currentLevel.targetDistance;
        const diff = Math.abs(finalX - targetX);

        if (diff <= 8) {
          // Bullseye target hit!
          soundManager.playVictory();
          setLaunchResult('HIT');
          setScore(prev => prev + 250 + (combo * 40));
          setCombo(prev => prev + 1);
          setTimeout(() => {
            if (levelIdx + 1 < PHYSICS_LEVELS.length) {
              setLevelIdx(prev => prev + 1);
            } else {
              finishGame();
            }
          }, 1400);
        } else if (finalX < targetX) {
          soundManager.playWrong();
          setLaunchResult('SHORT');
          setCombo(0);
        } else {
          soundManager.playWrong();
          setLaunchResult('OVERSHOT');
          setCombo(0);
        }
        return;
      }

      setProjectilePos({ x: Math.min(95, Math.max(5, currentX)), y: Math.max(10, currentY) });
      animFrameRef.current = requestAnimationFrame(simulate);
    };

    animFrameRef.current = requestAnimationFrame(simulate);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const finishGame = () => {
    onFinish({
      score,
      accuracy: 90,
      durationSeconds: 40,
      combo,
      level: levelIdx + 1,
      completed: true
    });
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '820px',
      margin: '0 auto',
      background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 15, 36, 0.92)',
      borderRadius: '24px',
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(45, 212, 191, 0.4)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      padding: '24px',
      color: isLight ? '#0f172a' : '#ffffff'
    }}>
      {/* Top HUD */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '12px 18px',
        borderRadius: '16px',
        background: 'rgba(0, 0, 0, 0.25)',
        fontSize: '0.88rem',
        fontWeight: 700
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2dd4bf' }}>
          <Compass size={18} /> Level {levelIdx + 1}: {currentLevel.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
          <Zap size={16} /> {score} pts
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Flame size={16} /> {combo}x Combo
        </div>
      </div>

      {/* Pre-Launch Physics Calculation Challenge */}
      {!solvedPreChallenge ? (
        <div style={{
          padding: '24px',
          borderRadius: '18px',
          background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2dd4bf', textTransform: 'uppercase', marginBottom: '8px' }}>
            Stage Calibration Challenge
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.45 }}>
            {currentLevel.challengeQ}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {currentLevel.challengeOpts.map((opt, i) => (
              <button
                key={i}
                onClick={() => handlePreChallenge(opt)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: isLight ? '#0f172a' : '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Interactive Physics Trajectory Canvas */
        <div style={{
          width: '100%',
          height: '260px',
          borderRadius: '18px',
          background: 'linear-gradient(to bottom, #091024 0%, #030712 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          {/* Ground */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '24px',
            background: 'linear-gradient(to top, #1e293b, rgba(30, 41, 59, 0.3))',
            borderTop: '2px dashed rgba(45, 212, 191, 0.4)'
          }} />

          {/* Target Portal */}
          <div style={{
            position: 'absolute',
            left: `${currentLevel.targetDistance}%`,
            bottom: '24px',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2dd4bf', marginBottom: '2px' }}>PORTAL</span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #2dd4bf 0%, rgba(45, 212, 191, 0.2) 70%)',
              border: '2px solid #2dd4bf',
              boxShadow: '0 0 15px #2dd4bf',
              animation: 'spin 6s linear infinite'
            }} />
          </div>

          {/* Flying / Resting Projectile */}
          <div style={{
            position: 'absolute',
            left: `${projectilePos.x}%`,
            top: `${projectilePos.y}%`,
            transform: 'translate(-50%, -50%)',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#38bdf8',
            boxShadow: '0 0 12px #38bdf8, 0 0 20px #ffffff',
            border: '2px solid #ffffff'
          }} />

          {/* Launch Cannon at Origin */}
          <div style={{
            position: 'absolute',
            left: '5%',
            bottom: '24px',
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: '#64748b',
            border: '2px solid #94a3b8'
          }} />

          {/* Feedback banner */}
          {launchResult && (
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: launchResult === 'HIT' ? '#10b981' : '#f59e0b',
              background: launchResult === 'HIT' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              border: `1px solid ${launchResult === 'HIT' ? '#10b981' : '#f59e0b'}`
            }}>
              {launchResult === 'HIT' ? '🎯 DIRECT HIT! PORTAL ENERGIZED' : launchResult === 'SHORT' ? '⚠️ SHOT FELL SHORT (Increase Velocity or Adjust Angle)' : '⚠️ OVERSHOT TARGET (Decrease Velocity)'}
            </div>
          )}
        </div>
      )}

      {/* Physics Launch Control Panel */}
      {solvedPreChallenge && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr) 140px',
          gap: '16px',
          alignItems: 'center',
          padding: '16px',
          borderRadius: '16px',
          background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Angle Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>Launch Angle (θ)</span>
              <span style={{ color: '#2dd4bf' }}>{angle}°</span>
            </div>
            <input
              type="range"
              min="15"
              max="75"
              value={angle}
              disabled={isLaunching}
              onChange={(e) => setAngle(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#2dd4bf' }}
            />
          </div>

          {/* Velocity Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>Initial Velocity (v₀)</span>
              <span style={{ color: '#38bdf8' }}>{velocity} m/s</span>
            </div>
            <input
              type="range"
              min="10"
              max="35"
              value={velocity}
              disabled={isLaunching}
              onChange={(e) => setVelocity(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Launch Trigger */}
          <button
            onClick={handleLaunch}
            disabled={isLaunching}
            style={{
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.92rem',
              border: 'none',
              cursor: isLaunching ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(45, 212, 191, 0.35)'
            }}
          >
            <Play size={16} /> Launch!
          </button>
        </div>
      )}
    </div>
  );
};

export default PhysicsRush;
