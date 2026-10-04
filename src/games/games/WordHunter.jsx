import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Zap, Flame, Clock, Target, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

const VOCAB_ROUNDS = [
  {
    targetWord: 'EPHEMERAL',
    type: 'SYNONYM',
    prompt: 'Find the SYNONYM of: EPHEMERAL',
    correct: 'Transient',
    words: ['Transient', 'Enduring', 'Immortal', 'Granular']
  },
  {
    targetWord: 'BENEVOLENT',
    type: 'ANTONYM',
    prompt: 'Find the ANTONYM of: BENEVOLENT',
    correct: 'Malevolent',
    words: ['Malevolent', 'Generous', 'Compassionate', 'Serene']
  },
  {
    targetWord: 'EQUIVOCAL',
    type: 'DEFINITION',
    prompt: 'Find definition of: EQUIVOCAL',
    correct: 'Ambiguous / Open to multiple interpretations',
    words: [
      'Ambiguous / Open to multiple interpretations',
      'Completely certain and verifiable',
      'Equal in weight and volume',
      'Relating to horseback riding'
    ]
  },
  {
    targetWord: 'ACCOMMODATE',
    type: 'SPELLING',
    prompt: 'Select the CORRECT SPELLING:',
    correct: 'Accommodate',
    words: ['Accommodate', 'Acommodate', 'Accomodate', 'Acomadate']
  }
];

export const WordHunter = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [floatingWords, setFloatingWords] = useState([]);

  const currentRound = VOCAB_ROUNDS[roundIdx];

  // Spawn words with positions
  useEffect(() => {
    onChallengeChange({ question: currentRound.prompt });
    const positions = [
      { x: 18, y: 22 },
      { x: 65, y: 30 },
      { x: 25, y: 65 },
      { x: 72, y: 70 }
    ];

    const mapped = currentRound.words.map((word, i) => ({
      word,
      x: positions[i % positions.length].x,
      y: positions[i % positions.length].y,
      isCorrect: word === currentRound.correct
    }));

    setFloatingWords(mapped);
  }, [roundIdx]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleWordClick = (targetItem) => {
    if (isPaused) return;

    if (targetItem.isCorrect) {
      soundManager.playCorrect();
      const points = 120 + (combo * 25);
      setScore(prev => prev + points);
      setCombo(prev => {
        const next = prev + 1;
        if (next % 3 === 0) soundManager.playCombo(next);
        return next;
      });
      onAttempt(null);

      if (roundIdx + 1 < VOCAB_ROUNDS.length) {
        setRoundIdx(prev => prev + 1);
      } else {
        finishGame();
      }
    } else {
      soundManager.playWrong();
      setCombo(0);
      onAttempt({
        question: currentRound.prompt,
        userAnswer: targetItem.word,
        correctAnswer: currentRound.correct
      });
    }
  };

  const finishGame = () => {
    onFinish({
      score,
      accuracy: 95,
      durationSeconds: 40 - timeLeft,
      combo,
      level: roundIdx + 1,
      completed: true
    });
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '820px',
      height: '520px',
      position: 'relative',
      background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 15, 36, 0.92)',
      borderRadius: '24px',
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(244, 63, 94, 0.4)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
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
        background: 'rgba(0, 0, 0, 0.3)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e' }}>
          <BookOpen size={18} /> Lexical Round {roundIdx + 1}/{VOCAB_ROUNDS.length}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.9rem', fontWeight: 700 }}>
          <div style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} /> {score} pts
          </div>
          <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={16} /> {combo}x Combo
          </div>
          <div style={{ color: timeLeft <= 10 ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} /> {timeLeft}s
          </div>
        </div>
      </div>

      {/* Target Clue Banner */}
      <div style={{
        padding: '16px',
        background: 'rgba(244, 63, 94, 0.12)',
        borderBottom: '1px solid rgba(244, 63, 94, 0.25)',
        textAlign: 'center',
        zIndex: 10
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Active Linguistic Radar
        </span>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '4px 0 0 0', color: isLight ? '#0f172a' : '#ffffff' }}>
          {currentRound.prompt}
        </h3>
      </div>

      {/* Lexical Floating Galaxy Field */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {floatingWords.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleWordClick(item)}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)',
              padding: '14px 22px',
              borderRadius: '16px',
              background: isLight ? '#ffffff' : 'rgba(20, 30, 65, 0.85)',
              border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1.5px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
              color: isLight ? '#0f172a' : '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              animation: `float${idx % 2 === 0 ? 'A' : 'B'} 3s ease-in-out infinite alternate`,
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
          >
            {item.word}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WordHunter;
