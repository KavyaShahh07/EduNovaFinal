import React, { useState, useEffect } from 'react';
import { Bug, Search, CheckCircle, AlertTriangle, Zap, Flame, Sparkles } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

const MISTAKE_CASES = [
  {
    subject: 'Physics',
    title: 'Kinematic Equation Velocity Square Error',
    flawedStatement: 'v² = u² + 2as³',
    tokens: ['v²', '=', 'u²', '+', '2as³'],
    flawedToken: '2as³',
    corrected: '2as (distance s is linear, not cubed: v² = u² + 2as)',
    explanation: 'In the third equation of motion, acceleration multiplied by displacement is 2as, not 2as³.'
  },
  {
    subject: 'Mathematics',
    title: 'Algebraic Binomial Expansion Fallacy',
    flawedStatement: '(x + y)² = x² + y²',
    tokens: ['(x + y)²', '=', 'x²', '+', 'y²'],
    flawedToken: 'x² + y²',
    corrected: 'x² + 2xy + y²',
    explanation: 'The classic "Freshman’s Dream" error forgets the crucial cross-product term +2xy.'
  },
  {
    subject: 'Chemistry',
    title: 'Unbalanced Water Synthesis Reaction',
    flawedStatement: 'H₂ + O₂ → H₂O',
    tokens: ['H₂', '+', 'O₂', '→', 'H₂O'],
    flawedToken: 'H₂ + O₂ → H₂O',
    corrected: '2H₂ + O₂ → 2H₂O',
    explanation: 'There are 2 Oxygen atoms on the reactants side and only 1 on the products side without stoichiometric coefficient 2.'
  }
];

export const MistakeHunter = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [caseIdx, setCaseIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const currentCase = MISTAKE_CASES[caseIdx];

  useEffect(() => {
    onChallengeChange({ question: `Mistake Hunter: Spot the error in ${currentCase.flawedStatement}` });
    setFeedback(null);
  }, [caseIdx]);

  const handleSelectToken = (token) => {
    if (feedback || isPaused) return;

    const isCorrect = token === currentCase.flawedToken || currentCase.flawedToken.includes(token);

    if (isCorrect) {
      soundManager.playCorrect();
      const points = 150 + (combo * 30);
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      onAttempt(null);

      setFeedback({
        isSuccess: true,
        text: `MISTAKE ISOLATED! Correction: ${currentCase.corrected}. ${currentCase.explanation}`
      });

      setTimeout(() => {
        if (caseIdx + 1 < MISTAKE_CASES.length) {
          setCaseIdx(prev => prev + 1);
        } else {
          finishGame();
        }
      }, 1600);
    } else {
      soundManager.playWrong();
      setCombo(0);
      onAttempt({
        question: currentCase.flawedStatement,
        userAnswer: token,
        correctAnswer: currentCase.flawedToken
      });

      setFeedback({
        isSuccess: false,
        text: `That segment is mathematically/scientifically valid. Search for the actual flaw!`
      });
    }
  };

  const finishGame = () => {
    onFinish({
      score,
      accuracy: 94,
      durationSeconds: 35,
      combo,
      level: caseIdx + 1,
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
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(239, 68, 68, 0.35)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
          <Bug size={18} /> {currentCase.subject}: {currentCase.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
          <Zap size={16} /> {score} pts
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Flame size={16} /> {combo}x Combo
        </div>
      </div>

      <p style={{ margin: '0 0 16px 0', fontSize: '0.92rem', color: isLight ? '#475569' : '#cbd5e1' }}>
        Click the precise flawed term or expression to isolate the bug:
      </p>

      {/* Flawed Expression Segment Chips */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        padding: '24px',
        borderRadius: '18px',
        background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '20px'
      }}>
        {currentCase.tokens.map((tok, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectToken(tok)}
            disabled={!!feedback || isPaused}
            style={{
              padding: '12px 20px',
              borderRadius: '14px',
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.07)',
              border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isLight ? '#0f172a' : '#ffffff',
              fontSize: '1.25rem',
              fontWeight: 800,
              cursor: feedback ? 'default' : 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.15s ease'
            }}
          >
            {tok}
          </button>
        ))}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '14px',
          background: feedback.isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${feedback.isSuccess ? '#10b981' : '#ef4444'}`,
          color: feedback.isSuccess ? '#10b981' : '#ef4444',
          fontWeight: 700,
          fontSize: '0.88rem',
          textAlign: 'center'
        }}>
          {feedback.text}
        </div>
      )}
    </div>
  );
};

export default MistakeHunter;
