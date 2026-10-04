import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, Flame, Heart, AlertOctagon, Sparkles } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';
import { DynamicGameContentGenerator } from '../shared/DynamicGameContentGenerator';

export const MathMeteorDefense = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [shieldHp, setShieldHp] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wave, setWave] = useState(1);
  const [activeMeteor, setActiveMeteor] = useState(null);
  const [meteorY, setMeteorY] = useState(5); // % from top
  const [laserFired, setLaserFired] = useState(false);
  const [explosion, setExplosion] = useState(false);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [correctHits, setCorrectHits] = useState(0);

  const meteorTimerRef = useRef(null);

  // Spawn next meteor dynamically
  const spawnMeteor = () => {
    const diff = wave > 6 ? 'HARD' : wave > 3 ? 'MEDIUM' : 'EASY';
    const challenge = DynamicGameContentGenerator.generateMathChallenge(diff);
    setActiveMeteor(challenge);
    setMeteorY(5);
    setLaserFired(false);
    setExplosion(false);
    onChallengeChange({ question: `Defend Planet: Solve ${challenge.equation}` });
  };

  useEffect(() => {
    spawnMeteor();
  }, []);

  // Falling meteor animation loop
  useEffect(() => {
    if (isPaused || !activeMeteor || explosion) return;

    meteorTimerRef.current = setInterval(() => {
      setMeteorY(prev => {
        if (prev >= 78) {
          // Impact on planet shield!
          clearInterval(meteorTimerRef.current);
          handleShieldImpact();
          return 78;
        }
        return prev + 1.8;
      });
    }, 100);

    return () => clearInterval(meteorTimerRef.current);
  }, [activeMeteor, isPaused, explosion]);

  const handleShieldImpact = () => {
    soundManager.playExplosion();
    setCombo(0);
    setShieldHp(prev => {
      const nextHp = prev - 1;
      if (nextHp <= 0) {
        setTimeout(finishGame, 600);
      } else {
        setTimeout(spawnMeteor, 800);
      }
      return nextHp;
    });
    onAttempt({
      question: `Meteor Impact: ${activeMeteor.equation}`,
      userAnswer: 'Timed Out / Shield Hit',
      correctAnswer: activeMeteor.answer
    });
  };

  const handleFireDefense = (opt) => {
    if (isPaused || !activeMeteor || explosion) return;

    setTotalAttempted(prev => prev + 1);
    const isCorrect = opt === activeMeteor.answer;

    if (isCorrect) {
      soundManager.playLaser();
      setLaserFired(true);

      setTimeout(() => {
        soundManager.playExplosion();
        setExplosion(true);
        const points = 120 + (combo * 25);
        setScore(prev => prev + points);
        setCombo(prev => {
          const next = prev + 1;
          if (next % 3 === 0) soundManager.playCombo(next);
          return next;
        });
        setCorrectHits(prev => prev + 1);
        onAttempt(null);

        setTimeout(() => {
          if (wave >= 10) {
            finishGame();
          } else {
            setWave(prev => prev + 1);
            spawnMeteor();
          }
        }, 600);
      }, 200);
    } else {
      soundManager.playWrong();
      setCombo(0);
      onAttempt({
        question: `Meteor Defense: ${activeMeteor.equation}`,
        userAnswer: opt,
        correctAnswer: activeMeteor.answer
      });
    }
  };

  const finishGame = () => {
    const accuracy = totalAttempted > 0 ? Math.round((correctHits / totalAttempted) * 100) : 100;
    onFinish({
      score,
      accuracy,
      durationSeconds: wave * 6,
      combo,
      level: wave,
      completed: shieldHp > 0
    });
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      height: '560px',
      position: 'relative',
      background: 'radial-gradient(ellipse at 50% 10%, #1e1b4b 0%, #030712 90%)',
      borderRadius: '24px',
      border: '1px solid rgba(245, 158, 11, 0.4)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none'
    }}>
      {/* HUD Header */}
      <div style={{
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.4)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b' }}>PLANETARY SHIELD</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                size={18}
                color="#ef4444"
                fill={i < shieldHp ? '#ef4444' : 'none'}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.9rem', fontWeight: 700 }}>
          <div style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} /> {score} pts
          </div>
          <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={16} /> {combo}x Combo
          </div>
          <div style={{ color: '#a855f7' }}>Wave {wave}/{MATH_CHALLENGES.length}</div>
        </div>
      </div>

      {/* Action Canvas Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Starfield backdrop */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 70px 120px, #38bdf8, rgba(0,0,0,0))',
          backgroundSize: '180px 180px',
          opacity: 0.5
        }} />

        {/* Falling Meteor */}
        {activeMeteor && !explosion && (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: `${meteorY}%`,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'top 0.1s linear',
            zIndex: 5
          }}>
            {/* Fiery meteor tail */}
            <div style={{
              width: '6px',
              height: '40px',
              background: 'linear-gradient(to top, #ef4444, rgba(239, 68, 68, 0))',
              marginBottom: '-6px'
            }} />

            {/* Meteor Sphere with Math Equation */}
            <div style={{
              minWidth: '130px',
              padding: '12px 18px',
              borderRadius: '20px',
              background: 'radial-gradient(circle at 35% 35%, #f97316 0%, #b91c1c 90%)',
              border: '2px solid #fed7aa',
              boxShadow: '0 0 25px rgba(249, 115, 22, 0.8), inset 0 0 10px #ffffff',
              color: '#ffffff',
              fontSize: '1.2rem',
              fontWeight: 900,
              textAlign: 'center',
              letterSpacing: '0.04em'
            }}>
              {activeMeteor.equation}
            </div>
          </div>
        )}

        {/* Explosion blast */}
        {explosion && (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: `${meteorY}%`,
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#fde047',
            fontSize: '1.8rem',
            fontWeight: 900,
            textShadow: '0 0 20px #ef4444',
            animation: 'ping 0.4s cubic-bezier(0, 0, 0.2, 1)'
          }}>
            💥 VAPORIZED!
          </div>
        )}

        {/* Laser beam */}
        {laserFired && (
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: '70px',
            top: `${meteorY + 6}%`,
            width: '4px',
            background: '#38bdf8',
            boxShadow: '0 0 15px #38bdf8, 0 0 30px #ffffff',
            transform: 'translateX(-50%)',
            zIndex: 4
          }} />
        )}

        {/* Planetary Defense Turret */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '75px',
          background: 'linear-gradient(to top, #0284c7 0%, rgba(2, 132, 199, 0.15) 100%)',
          borderTop: '2px solid #38bdf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(56, 189, 248, 0.3)'
        }}>
          <div style={{
            width: '60px',
            height: '40px',
            borderRadius: '12px 12px 0 0',
            background: '#38bdf8',
            boxShadow: '0 0 20px #38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
            fontWeight: 900,
            fontSize: '0.75rem'
          }}>
            CANNON
          </div>
        </div>
      </div>

      {/* Turret targeting controls */}
      {activeMeteor && (
        <div style={{
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.6)',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          zIndex: 10
        }}>
          {activeMeteor.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleFireDefense(opt)}
              disabled={isPaused || explosion}
              style={{
                flex: 1,
                maxWidth: '180px',
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(37, 99, 235, 0.35) 100%)',
                border: '1.5px solid #38bdf8',
                color: '#ffffff',
                fontSize: '1.1rem',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)',
                transition: 'all 0.12s ease'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MathMeteorDefense;
