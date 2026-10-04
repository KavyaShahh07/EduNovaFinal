import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Zap, Clock, Award, Coffee, Wind } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

const FOCUS_CHALLENGES = [
  {
    type: 'BREATH_FOCUS',
    instruction: 'Inhale with the expanding ring, hold, and tap when alignment reaches 100% harmony.',
    prompt: 'Mindful Concept: Neuroplasticity refers to the brain’s ability to rewire neural connections through focused practice.',
    options: ['Affirm Concept (True)', 'Dismiss'],
    answer: 'Affirm Concept (True)'
  },
  {
    type: 'CALM_MATH',
    instruction: 'Maintain steady focus and solve smoothly without rushing:',
    prompt: 'Calculate: (8 × 7) - 6 = ?',
    options: ['50', '48', '52', '56'],
    answer: '50'
  },
  {
    type: 'SPECTRUM_MATCH',
    instruction: 'Select the color that represents the highest photon energy in visible light:',
    prompt: 'Visible Spectrum Energy Gradient: Red → Green → Violet',
    options: ['Violet (Highest Frequency / Energy)', 'Red (Longest Wavelength)', 'Green (Mid-spectrum)', 'Yellow'],
    answer: 'Violet (Highest Frequency / Energy)'
  }
];

export const FocusFlow = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [focusMeter, setFocusMeter] = useState(65); // 0 to 100%
  const [streak, setStreak] = useState(1);
  const [score, setScore] = useState(0);
  const [isBreathingIn, setIsBreathingIn] = useState(true);

  const currentChallenge = FOCUS_CHALLENGES[challengeIdx];

  useEffect(() => {
    onChallengeChange({ question: currentChallenge.prompt });
  }, [challengeIdx]);

  // Gentle breathing cycle
  useEffect(() => {
    const breathCycle = setInterval(() => {
      setIsBreathingIn(prev => !prev);
    }, 4000);

    return () => clearInterval(breathCycle);
  }, []);

  const handleSelect = (opt) => {
    if (isPaused) return;

    const isCorrect = opt === currentChallenge.answer;

    if (isCorrect) {
      soundManager.playCorrect();
      setFocusMeter(prev => Math.min(100, prev + 15));
      const points = 100 + streak * 20;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      onAttempt(null);

      if (challengeIdx + 1 < FOCUS_CHALLENGES.length) {
        setChallengeIdx(prev => prev + 1);
      } else {
        finishFlow();
      }
    } else {
      soundManager.playClick();
      // Gentle feedback, no harsh penalty
      setFocusMeter(prev => Math.max(20, prev - 10));
      onAttempt({
        question: currentChallenge.prompt,
        userAnswer: opt,
        correctAnswer: currentChallenge.answer
      });
    }
  };

  const finishFlow = () => {
    onFinish({
      score: score + 150,
      accuracy: 95,
      durationSeconds: 45,
      combo: streak,
      level: challengeIdx + 1,
      completed: true
    });
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '740px',
      margin: '0 auto',
      background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 15, 36, 0.92)',
      borderRadius: '24px',
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(45, 212, 191, 0.4)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      padding: '28px',
      color: isLight ? '#0f172a' : '#ffffff',
      textAlign: 'center'
    }}>
      {/* Top HUD */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        padding: '12px 18px',
        borderRadius: '16px',
        background: 'rgba(0, 0, 0, 0.25)',
        fontSize: '0.88rem',
        fontWeight: 700
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2dd4bf' }}>
          <Wind size={18} /> Focus Flow State
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
          <Zap size={16} /> {score} Flow Points
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7' }}>
          <Sparkles size={16} /> {streak} Streak
        </div>
      </div>

      {/* Focus Meter Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#2dd4bf', marginBottom: '6px' }}>
          <span>FOCUS FLOW METER</span>
          <span>{focusMeter}% ALIGNED</span>
        </div>
        <div style={{ width: '100%', height: '10px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          <div style={{
            width: `${focusMeter}%`,
            height: '100%',
            background: 'linear-gradient(to right, #0d9488 0%, #2dd4bf 100%)',
            boxShadow: '0 0 12px #2dd4bf',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Mindful Breathing Sphere Animation */}
      <div style={{
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        margin: '0 auto 24px',
        background: 'radial-gradient(circle at 35% 35%, #99f6e4 0%, #0d9488 70%)',
        boxShadow: '0 0 35px rgba(45, 212, 191, 0.5), inset 0 0 15px #ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#042f2e',
        fontWeight: 900,
        fontSize: '0.85rem',
        transform: isBreathingIn ? 'scale(1.15)' : 'scale(0.92)',
        transition: 'transform 4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {isBreathingIn ? 'INHALE...' : 'EXHALE...'}
      </div>

      {/* Challenge Card */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px 0' }}>
        {currentChallenge.prompt}
      </h3>
      <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8' }}>
        {currentChallenge.instruction}
      </p>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {currentChallenge.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(opt)}
            disabled={isPaused}
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
              border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(45, 212, 191, 0.25)',
              color: isLight ? '#0f172a' : '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
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

export default FocusFlow;
