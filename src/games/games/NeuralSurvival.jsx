import React, { useState, useEffect } from 'react';
import { Shield, Zap, Flame, Clock, Heart, Skull, Sparkles } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';
import { DynamicGameContentGenerator } from '../shared/DynamicGameContentGenerator';

const INITIAL_SURVIVAL_POOL = [
  {
    subject: 'Physics',
    q: 'Newton’s First Law describes the law of:',
    opts: ['Inertia', 'Action-Reaction', 'Gravitation', 'Entropy'],
    ans: 'Inertia'
  },
  {
    subject: 'Math',
    q: 'Value of sin(90°) + cos(0°):',
    opts: ['2 (1 + 1)', '1', '0', '0.5'],
    ans: '2 (1 + 1)'
  },
  {
    subject: 'Chemistry',
    q: 'Atomic number of Carbon (C):',
    opts: ['6', '12', '14', '8'],
    ans: '6'
  },
  {
    subject: 'Coding',
    q: 'Time complexity of Binary Search in a sorted array:',
    opts: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'],
    ans: 'O(log n)'
  },
  {
    subject: 'Logic',
    q: 'If all Z are W, and some W are Q, are all Z necessarily Q?',
    opts: ['No (Not necessarily)', 'Yes (Always)', 'Only if Q is empty', 'Yes by deduction'],
    ans: 'No (Not necessarily)'
  },
  {
    subject: 'Physics',
    q: 'Unit of electric charge is:',
    opts: ['Coulomb (C)', 'Ampere (A)', 'Volt (V)', 'Ohm (Ω)'],
    ans: 'Coulomb (C)'
  },
  {
    subject: 'Math',
    q: 'Solve for x: log₁₀(1000) = x',
    opts: ['3', '100', '10', '30'],
    ans: '3'
  }
];

export const NeuralSurvival = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [pool, setPool] = useState(INITIAL_SURVIVAL_POOL);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wave, setWave] = useState(1);
  const [survivalSeconds, setSurvivalSeconds] = useState(0);
  const [waveTimeLeft, setWaveTimeLeft] = useState(10);
  const [qIdx, setQIdx] = useState(0);

  const currentQ = pool[qIdx % pool.length];

  useEffect(() => {
    if (currentQ) {
      onChallengeChange({ question: `Neural Survival Wave ${wave}: ${currentQ.q}` });
      // Scale timer speed with waves (from 10s down to 5s)
      setWaveTimeLeft(Math.max(5, 10 - Math.floor(wave / 4)));
    }
  }, [wave, qIdx, currentQ]);

  // Overall survival clock
  useEffect(() => {
    if (isPaused || lives <= 0) return;

    const clock = setInterval(() => {
      setSurvivalSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(clock);
  }, [isPaused, lives]);

  // Rapid countdown per question wave
  useEffect(() => {
    if (isPaused || lives <= 0) return;

    const waveTimer = setInterval(() => {
      setWaveTimeLeft(prev => {
        if (prev <= 1) {
          // Timeout counts as a lost life!
          handleLifeLost('Time expired on wave challenge');
          return Math.max(5, 10 - Math.floor(wave / 4));
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(waveTimer);
  }, [wave, qIdx, isPaused, lives]);

  const advanceWave = () => {
    if (qIdx + 2 >= pool.length) {
      const dynMath = DynamicGameContentGenerator.generateMathChallenge(wave > 5 ? 'HARD' : 'MEDIUM');
      setPool(prev => [...prev, {
        subject: 'Mathematics',
        q: dynMath.equation,
        opts: dynMath.options,
        ans: dynMath.answer
      }]);
    }
    setQIdx(p => p + 1);
    setWave(w => w + 1);
  };

  const handleLifeLost = (reason) => {
    soundManager.playWrong();
    setCombo(0);
    setLives(prev => {
      const next = prev - 1;
      if (next <= 0) {
        setTimeout(finishSurvival, 600);
      } else {
        advanceWave();
      }
      return next;
    });

    onAttempt({
      question: currentQ.q,
      userAnswer: reason,
      correctAnswer: currentQ.ans
    });
  };

  const handleAnswer = (opt) => {
    if (lives <= 0 || isPaused) return;

    const isCorrect = opt === currentQ.ans;

    if (isCorrect) {
      soundManager.playCorrect();
      const points = 100 + (combo * 25) + (wave * 10);
      setScore(prev => prev + points);
      setCombo(prev => {
        const next = prev + 1;
        if (next % 3 === 0) soundManager.playCombo(next);
        return next;
      });
      onAttempt(null);
      advanceWave();
    } else {
      handleLifeLost(opt);
    }
  };

  const finishSurvival = () => {
    onFinish({
      score,
      accuracy: Math.max(60, 100 - (3 - lives) * 12),
      durationSeconds: survivalSeconds,
      combo,
      level: wave,
      stats: { survivalSeconds, wavesCleared: wave - 1 }
    });
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '780px',
      margin: '0 auto',
      background: 'radial-gradient(ellipse at 50% 10%, #1e1b4b 0%, #030712 90%)',
      borderRadius: '24px',
      border: '1.5px solid rgba(168, 85, 247, 0.4)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      padding: '24px',
      color: '#ffffff'
    }}>
      {/* Top HUD */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '12px 18px',
        borderRadius: '16px',
        background: 'rgba(0, 0, 0, 0.4)',
        fontSize: '0.88rem',
        fontWeight: 700
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#c084fc', textTransform: 'uppercase' }}>LIVES:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                size={18}
                color="#ef4444"
                fill={i < lives ? '#ef4444' : 'none'}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={16} /> {survivalSeconds}s Survived
          </div>
          <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={16} /> {combo}x Combo
          </div>
          <div style={{ color: '#10b981' }}>{score} pts</div>
        </div>
      </div>

      {/* Wave Header & Timer Bar */}
      <div style={{
        padding: '20px',
        borderRadius: '18px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c084fc' }}>
            SURVIVAL WAVE {wave} • {currentQ.subject.toUpperCase()}
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: waveTimeLeft <= 3 ? '#ef4444' : '#38bdf8' }}>
            {waveTimeLeft}s remaining
          </span>
        </div>

        {/* Rapid depletion bar */}
        <div style={{ width: '100%', height: '8px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          <div style={{
            width: `${(waveTimeLeft / Math.max(5, 10 - Math.floor(wave / 4))) * 100}%`,
            height: '100%',
            background: waveTimeLeft <= 3 ? '#ef4444' : '#38bdf8',
            transition: 'width 1s linear'
          }} />
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '16px 0 0 0', lineHeight: 1.45 }}>
          {currentQ.q}
        </h3>
      </div>

      {/* Options Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {currentQ.opts.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(opt)}
            disabled={lives <= 0 || isPaused}
            style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NeuralSurvival;
