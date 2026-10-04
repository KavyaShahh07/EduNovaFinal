import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Key, ShieldAlert, CheckCircle, ArrowRight, Zap, Flame, Clock } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

const ESCAPE_ROOMS = [
  {
    roomNumber: 1,
    title: 'Chamber I: The Deductive Gate',
    premise: 'All prime numbers greater than 2 are odd. Number X is an even prime.',
    question: 'What is the exact value of X?',
    options: ['X = 2', 'X = 4', 'X does not exist', 'X = 0'],
    answer: 'X = 2',
    explanation: '2 is the only even prime number because all higher even numbers are divisible by 2.'
  },
  {
    roomNumber: 2,
    title: 'Chamber II: Conditional Trap',
    premise: 'Statement: "If it rains (P), the ground is wet (Q)". The ground is NOT wet (¬Q).',
    question: 'By Modus Tollens, what is the valid conclusion?',
    options: ['It did not rain (¬P)', 'It rained (P)', 'The sun is shining', 'No conclusion possible'],
    answer: 'It did not rain (¬P)',
    explanation: 'Modus Tollens dictates: If P → Q and ¬Q, then ¬P.'
  },
  {
    roomNumber: 3,
    title: 'Chamber III: The Boolean Vault',
    premise: 'Given inputs A = TRUE, B = FALSE. Gate function: NOT (A AND (NOT B)).',
    question: 'What is the boolean output of the circuit?',
    options: ['FALSE (0)', 'TRUE (1)', 'UNDEFINED', 'HIGH-IMPEDANCE'],
    answer: 'FALSE (0)',
    explanation: 'NOT B is TRUE. A AND TRUE is TRUE. NOT (TRUE) evaluates to FALSE.'
  },
  {
    roomNumber: 4,
    title: 'Chamber IV: Syllogism Passage',
    premise: 'Premise 1: All polymers are composed of monomers. Premise 2: DNA is a polymer.',
    question: 'Which deduction is necessarily true?',
    options: [
      'DNA is composed of monomers',
      'All monomers are DNA',
      'Proteins cannot be polymers',
      'Polymers cannot replicate'
    ],
    answer: 'DNA is composed of monomers',
    explanation: 'By transitive property of categorical syllogisms, DNA must possess the property of polymers.'
  },
  {
    roomNumber: 5,
    title: 'Chamber V: Master Cryptic Terminal',
    premise: 'Sequence: 2, 6, 12, 20, 30, ?',
    question: 'What number unlocks the final sanctuary portal?',
    options: ['42 (6×7)', '40', '36', '44'],
    answer: '42 (6×7)',
    explanation: 'The series follows n(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42.'
  }
];

export const LogicEscape = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(75);
  const [attempts, setAttempts] = useState(0);
  const [correctRooms, setCorrectRooms] = useState(0);
  const [feedback, setFeedback] = useState(null); // { isCorrect, explanation }

  const currentRoom = ESCAPE_ROOMS[currentRoomIndex];

  useEffect(() => {
    onChallengeChange({
      question: `${currentRoom.title}: ${currentRoom.question}`
    });
  }, [currentRoomIndex]);

  useEffect(() => {
    if (isPaused || feedback) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishEscape();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, feedback]);

  const handleSelectOption = (opt) => {
    if (feedback || isPaused) return;

    setAttempts(prev => prev + 1);
    const isCorrect = opt === currentRoom.answer;

    if (isCorrect) {
      soundManager.playCorrect();
      const points = 150 + (combo * 30);
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      setCorrectRooms(prev => prev + 1);
      onAttempt(null);

      setFeedback({
        isCorrect: true,
        text: 'Vault Chamber Unlocked! Security doors opening...'
      });

      setTimeout(() => {
        setFeedback(null);
        if (currentRoomIndex + 1 < ESCAPE_ROOMS.length) {
          setCurrentRoomIndex(prev => prev + 1);
        } else {
          finishEscape();
        }
      }, 1200);
    } else {
      soundManager.playWrong();
      setCombo(0);
      onAttempt({
        question: `${currentRoom.premise} — ${currentRoom.question}`,
        userAnswer: opt,
        correctAnswer: currentRoom.answer
      });

      setFeedback({
        isCorrect: false,
        text: currentRoom.explanation
      });
    }
  };

  const handleRetryAfterExplanation = () => {
    setFeedback(null);
  };

  const finishEscape = () => {
    const accuracy = attempts > 0 ? Math.round((correctRooms / attempts) * 100) : 100;
    onFinish({
      score,
      accuracy,
      durationSeconds: 75 - timeLeft,
      combo,
      level: currentRoomIndex + 1,
      completed: currentRoomIndex + 1 === ESCAPE_ROOMS.length
    });
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '750px',
      margin: '0 auto',
      background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 15, 36, 0.92)',
      borderRadius: '24px',
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(16, 185, 129, 0.3)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
          <Key size={18} /> Room {currentRoomIndex + 1} of {ESCAPE_ROOMS.length}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
          <Zap size={16} /> {score} pts
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Flame size={16} /> {combo}x Combo
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: timeLeft <= 15 ? '#ef4444' : '#e2e8f0' }}>
          <Clock size={16} /> {timeLeft}s
        </div>
      </div>

      {/* Vault Chamber Visual Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '20px',
        padding: '16px',
        borderRadius: '16px',
        background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {feedback?.isCorrect ? <Unlock size={26} color="#10b981" /> : <Lock size={26} color="#34d399" />}
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0' }}>
            {currentRoom.title}
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8' }}>
            {currentRoom.premise}
          </p>
        </div>
      </div>

      {/* Room Puzzle Prompt */}
      <div style={{
        fontSize: '1.05rem',
        fontWeight: 700,
        marginBottom: '20px',
        lineHeight: 1.5,
        color: isLight ? '#1e293b' : '#f1f5f9'
      }}>
        {currentRoom.question}
      </div>

      {/* Answer Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '24px' }}>
        {currentRoom.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectOption(opt)}
            disabled={!!feedback || isPaused}
            style={{
              padding: '14px 18px',
              borderRadius: '14px',
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
              border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isLight ? '#0f172a' : '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 600,
              textAlign: 'left',
              cursor: feedback ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{opt}</span>
            <ArrowRight size={16} color="#64748b" />
          </button>
        ))}
      </div>

      {/* Feedback & Explanation Drawer */}
      {feedback && (
        <div style={{
          padding: '16px',
          borderRadius: '16px',
          background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${feedback.isCorrect ? '#10b981' : '#ef4444'}`,
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.9rem', color: feedback.isCorrect ? '#10b981' : '#ef4444', marginBottom: '6px' }}>
            {feedback.isCorrect ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
            {feedback.isCorrect ? 'Door Code Verified!' : 'Logic Failure — Educational Breakdown:'}
          </div>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: 1.45 }}>
            {feedback.text}
          </p>
          {!feedback.isCorrect && (
            <button
              onClick={handleRetryAfterExplanation}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Try Again With New Insight
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LogicEscape;
