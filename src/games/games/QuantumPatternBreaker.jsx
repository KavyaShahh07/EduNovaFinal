import React, { useState, useEffect } from 'react';
import { Eye, Zap, Flame, Clock, HelpCircle, Check, X } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';
import { DynamicGameContentGenerator } from '../shared/DynamicGameContentGenerator';

const BASE_PATTERNS = [
  {
    type: 'NUMBER_SERIES',
    prompt: 'Identify the next number in this Fibonacci-derived sequence:',
    display: ['3', '5', '8', '13', '21', '?'],
    options: ['34', '31', '33', '38'],
    answer: '34',
    rule: 'Each term is the sum of the preceding two terms (13 + 21 = 34).'
  },
  {
    type: 'GEOMETRIC_PROGRESSION',
    prompt: 'Calculate the missing exponent in the quantum growth curve:',
    display: ['2', '6', '18', '54', '?'],
    options: ['162', '108', '144', '180'],
    answer: '162',
    rule: 'Geometric sequence with common ratio r = 3 (54 × 3 = 162).'
  },
  {
    type: 'POLYGON_SIDES',
    prompt: 'Determine the missing geometric structure in the sequence:',
    display: ['▲ (Triangle: 3)', '■ (Square: 4)', '⬟ (Pentagon: 5)', '?'],
    options: ['⬡ (Hexagon: 6)', '◆ (Rhombus: 4)', '● (Circle: 1)', '★ (Star: 10)'],
    answer: '⬡ (Hexagon: 6)',
    rule: 'Number of polygon sides increments by +1 in each successive step.'
  },
  {
    type: 'BINARY_STEPS',
    prompt: 'Decipher the next binary quantum power bit:',
    display: ['2⁰ (1)', '2¹ (2)', '2² (4)', '2³ (8)', '?'],
    options: ['2⁴ (16)', '2⁵ (32)', '2⁴ (12)', '3² (9)'],
    answer: '2⁴ (16)',
    rule: 'Binary powers of 2 increment exponent by 1 (2⁴ = 16).'
  },
  {
    type: 'ODD_ONE_OUT',
    prompt: 'Detect the quantum anomaly (the odd element out):',
    display: ['2', '3', '5', '7', '9', '11'],
    options: ['9 (Composite: 3×3)', '7 (Prime)', '2 (Even Prime)', '11 (Prime)'],
    answer: '9 (Composite: 3×3)',
    rule: 'All other elements are prime numbers; 9 is composite (3 × 3).'
  },
  {
    type: 'SYMBOL_ROTATION',
    prompt: 'Predict the 90° clockwise phase shift of the indicator:',
    display: ['⬆ (0°)', '➡ (90°)', '⬇ (180°)', '?'],
    options: ['⬅ (270°)', '⬆ (360°)', '↗ (45°)', '↘ (135°)'],
    answer: '⬅ (270°)',
    rule: 'Rotating clockwise in increments of +90 degrees.'
  }
];

export const QuantumPatternBreaker = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [patternList, setPatternList] = useState(BASE_PATTERNS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(50);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const currentPattern = patternList[currentIndex] || patternList[0];

  useEffect(() => {
    if (currentPattern) {
      onChallengeChange({
        question: `${currentPattern.prompt} [${currentPattern.display.join(', ')}]`
      });
    }
  }, [currentIndex, currentPattern]);

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

  const handleSelectOption = (opt) => {
    if (isPaused) return;

    setTotalAttempts(prev => prev + 1);
    const isCorrect = opt === currentPattern.answer;

    if (isCorrect) {
      soundManager.playCorrect();
      const points = 100 + (combo * 25);
      setScore(prev => prev + points);
      setCombo(prev => {
        const next = prev + 1;
        if (next % 3 === 0) soundManager.playCombo(next);
        return next;
      });
      setCorrectAnswers(prev => prev + 1);
      onAttempt(null);
    } else {
      soundManager.playWrong();
      setCombo(0);
      onAttempt({
        question: currentPattern.prompt,
        userAnswer: opt,
        correctAnswer: currentPattern.answer
      });
    }

    if (currentIndex + 1 < 10) {
      if (currentIndex + 1 >= patternList.length) {
        const nextGen = DynamicGameContentGenerator.generatePatternChallenge();
        setPatternList(prev => [...prev, nextGen]);
      }
      setCurrentIndex(prev => prev + 1);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 100;
    onFinish({
      score,
      accuracy,
      durationSeconds: 50 - timeLeft,
      combo,
      level: currentIndex + 1,
      completed: currentIndex + 1 === PATTERNS.length
    });
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '740px',
      margin: '0 auto',
      background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 15, 36, 0.92)',
      borderRadius: '24px',
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(168, 85, 247, 0.3)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      padding: '28px',
      color: isLight ? '#0f172a' : '#ffffff'
    }}>
      {/* HUD Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
          <Eye size={18} /> Pattern {currentIndex + 1} of {PATTERNS.length}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
          <Zap size={16} /> {score} pts
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Flame size={16} /> {combo}x Combo
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: timeLeft <= 10 ? '#ef4444' : '#10b981' }}>
          <Clock size={16} /> {timeLeft}s
        </div>
      </div>

      {/* Prompt */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.45 }}>
        {currentPattern.prompt}
      </h3>

      {/* Pattern Visual Display Track */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        padding: '24px 16px',
        borderRadius: '18px',
        background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '28px'
      }}>
        {currentPattern.display.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px 20px',
              borderRadius: '14px',
              background: item === '?'
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(56, 189, 248, 0.2) 100%)'
                : isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
              border: item === '?' ? '2px dashed #c084fc' : '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '1.25rem',
              fontWeight: 900,
              color: item === '?' ? '#c084fc' : isLight ? '#0f172a' : '#ffffff',
              boxShadow: item === '?' ? '0 0 16px rgba(192, 132, 252, 0.4)' : 'none',
              minWidth: '60px',
              textAlign: 'center'
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Options Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {currentPattern.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectOption(opt)}
            disabled={isPaused}
            style={{
              padding: '16px',
              borderRadius: '14px',
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
              border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isLight ? '#0f172a' : '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'center'
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuantumPatternBreaker;
