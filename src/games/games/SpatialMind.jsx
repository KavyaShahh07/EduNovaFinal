import React, { useState, useEffect } from 'react';
import { Box, RotateCw, RotateCcw, Zap, Flame, Check, HelpCircle } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

const SPATIAL_CHALLENGES = [
  {
    title: 'Isometric Cube 90° Y-Axis Rotation',
    prompt: 'Mentally rotate this 3D block 90° clockwise around the vertical Y-axis. Which orientation is identical?',
    initialFaces: { front: '🔷 Cyan Square', top: '🟡 Amber Circle', right: '🔴 Red Triangle' },
    options: [
      'Front: Red Triangle, Top: Amber Circle, Right: (Hidden)',
      'Front: Cyan Square, Top: Red Triangle, Right: Amber Circle',
      'Front: Amber Circle, Top: Cyan Square, Right: Red Triangle',
      'Front: Red Triangle, Top: Cyan Square, Right: Amber Circle'
    ],
    answer: 'Front: Red Triangle, Top: Amber Circle, Right: (Hidden)',
    explanation: 'Rotating 90° clockwise around the Y-axis brings the Right face (Red Triangle) to the Front, while the Top face (Amber Circle) remains on top.'
  },
  {
    title: 'Unfolded Net Cube Folding',
    prompt: 'A standard cube net has faces 1 opposite to 6, 2 opposite to 5, and 3 opposite to 4. If face 1 is on the bottom, which face is on the top?',
    initialFaces: { front: 'Standard 6-Sided Die Net' },
    options: ['Face 6', 'Face 5', 'Face 2', 'Face 4'],
    answer: 'Face 6',
    explanation: 'Opposite faces on a standard die cube always sum to 7. Opposite face to 1 is 6.'
  },
  {
    title: 'Mirror Symmetry Inversion',
    prompt: 'Which letter retains exact symmetry when reflected across a vertical mirror plane?',
    initialFaces: { front: 'Reflective Symmetry Plane' },
    options: ['Letter "M"', 'Letter "R"', 'Letter "L"', 'Letter "F"'],
    answer: 'Letter "M"',
    explanation: 'The letter "M" has vertical bilateral symmetry and is invariant under vertical plane reflection.'
  }
];

export const SpatialMind = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);

  const currentChallenge = SPATIAL_CHALLENGES[challengeIdx];

  useEffect(() => {
    onChallengeChange({ question: `${currentChallenge.title}: ${currentChallenge.prompt}` });
    setRotationAngle(0);
  }, [challengeIdx]);

  const handleSelectOption = (opt) => {
    if (isPaused) return;

    const isCorrect = opt === currentChallenge.answer;

    if (isCorrect) {
      soundManager.playCorrect();
      const points = 140 + (combo * 25);
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      onAttempt(null);

      if (challengeIdx + 1 < SPATIAL_CHALLENGES.length) {
        setChallengeIdx(prev => prev + 1);
      } else {
        finishGame();
      }
    } else {
      soundManager.playWrong();
      setCombo(0);
      onAttempt({
        question: currentChallenge.prompt,
        userAnswer: opt,
        correctAnswer: currentChallenge.answer
      });
    }
  };

  const finishGame = () => {
    onFinish({
      score,
      accuracy: 90,
      durationSeconds: 35,
      combo,
      level: challengeIdx + 1,
      completed: true
    });
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '780px',
      margin: '0 auto',
      background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 15, 36, 0.92)',
      borderRadius: '24px',
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(168, 85, 247, 0.35)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      padding: '24px',
      color: isLight ? '#0f172a' : '#ffffff'
    }}>
      {/* HUD Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
          <Box size={18} /> {currentChallenge.title} ({challengeIdx + 1}/{SPATIAL_CHALLENGES.length})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
          <Zap size={16} /> {score} pts
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Flame size={16} /> {combo}x Combo
        </div>
      </div>

      {/* 3D Isometric Rotating Preview Box */}
      <div style={{
        height: '220px',
        borderRadius: '18px',
        background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: '20px',
        perspective: '800px'
      }}>
        {/* Isometric 3D Cube Representation */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
          boxShadow: '0 10px 30px rgba(168, 85, 247, 0.5)',
          transform: `rotateX(25deg) rotateY(${rotationAngle}deg)`,
          transition: 'transform 0.4s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '1rem',
          border: '2px solid rgba(255, 255, 255, 0.4)'
        }}>
          3D CUBE
        </div>

        {/* Rotation Inspector Controls */}
        <div style={{ position: 'absolute', bottom: '12px', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setRotationAngle(prev => prev - 45)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={12} /> -45°
          </button>
          <button
            onClick={() => setRotationAngle(prev => prev + 45)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCw size={12} /> +45°
          </button>
        </div>
      </div>

      {/* Challenge Prompt */}
      <p style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 20px 0', lineHeight: 1.5 }}>
        {currentChallenge.prompt}
      </p>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
        {currentChallenge.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectOption(opt)}
            disabled={isPaused}
            style={{
              padding: '14px 18px',
              borderRadius: '14px',
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
              border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isLight ? '#0f172a' : '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
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

export default SpatialMind;
