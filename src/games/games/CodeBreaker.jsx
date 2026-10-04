import React, { useState, useEffect } from 'react';
import { Terminal, Bug, CheckCircle2, Play, Zap, Flame, ShieldAlert, ArrowRight } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

const CODE_CHALLENGES = [
  {
    language: 'JavaScript',
    title: 'Array Accumulator Off-by-One',
    buggyCode: `function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`,
    expected: 'Returns correct numerical sum without NaN',
    actual: 'Returns NaN because arr[arr.length] is undefined',
    options: [
      'Change loop condition to: i < arr.length',
      'Initialize let i = 1',
      'Change sum += arr[i] to sum = arr[i]',
      'Multiply by arr.length at the end'
    ],
    answer: 'Change loop condition to: i < arr.length',
    explanation: 'Array indices in JavaScript are zero-based (0 to length-1). Using <= accesses an out-of-bounds undefined element.'
  },
  {
    language: 'Python',
    title: 'Mutable Default Argument Bug',
    buggyCode: `def append_item(val, target_list=[]):
    target_list.append(val)
    return target_list`,
    expected: 'Fresh list created per default invocation',
    actual: 'target_list persists across successive function calls',
    options: [
      'def append_item(val, target_list=None): if target_list is None: target_list = []',
      'target_list.clear() before return',
      'def append_item(val, target_list=()):',
      'target_list = list(target_list)'
    ],
    answer: 'def append_item(val, target_list=None): if target_list is None: target_list = []',
    explanation: 'Default arguments in Python are evaluated once at function definition time, making mutable defaults shared across calls.'
  },
  {
    language: 'JavaScript',
    title: 'Strict Equality & Type Coercion',
    buggyCode: `function isEligible(age) {
  // Buggy comparison allows unexpected string coercion
  if (age == "18") {
    return "Exact 18";
  }
  return "Other";
}`,
    expected: 'Strict type validation preventing "18" string bugs',
    actual: 'Loose equality (==) coerces string "18" into number 18',
    options: [
      'Use strict equality: age === 18',
      'Use typeof age == "number"',
      'Use age >= "18"',
      'Use parseInt(age) == age'
    ],
    answer: 'Use strict equality: age === 18',
    explanation: 'Strict equality (===) compares both value and datatype without implicit coercion.'
  }
];

export const CodeBreaker = ({
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
  const [testResult, setTestResult] = useState(null); // { passed, message }

  const currentChallenge = CODE_CHALLENGES[challengeIdx];

  useEffect(() => {
    onChallengeChange({
      question: `Debug ${currentChallenge.language}: ${currentChallenge.title}`
    });
    setTestResult(null);
  }, [challengeIdx]);

  const handleSelectFix = (opt) => {
    if (testResult || isPaused) return;

    const isCorrect = opt === currentChallenge.answer;

    if (isCorrect) {
      soundManager.playCorrect();
      const points = 160 + (combo * 35);
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      onAttempt(null);

      setTestResult({
        passed: true,
        message: 'PASS: Test suite executed with 0 errors. All assertions passed!'
      });

      setTimeout(() => {
        if (challengeIdx + 1 < CODE_CHALLENGES.length) {
          setChallengeIdx(prev => prev + 1);
        } else {
          finishGame();
        }
      }, 1500);
    } else {
      soundManager.playWrong();
      setCombo(0);
      onAttempt({
        question: `${currentChallenge.title} (${currentChallenge.language})`,
        userAnswer: opt,
        correctAnswer: currentChallenge.answer
      });

      setTestResult({
        passed: false,
        message: `FAIL: ${currentChallenge.explanation}`
      });
    }
  };

  const finishGame = () => {
    onFinish({
      score,
      accuracy: 92,
      durationSeconds: 45,
      combo,
      level: challengeIdx + 1,
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
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(56, 189, 248, 0.3)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
          <Terminal size={18} /> Challenge {challengeIdx + 1}/{CODE_CHALLENGES.length}: {currentChallenge.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
          <Zap size={16} /> {score} pts
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Flame size={16} /> {combo}x Combo
        </div>
      </div>

      {/* Code Editor Mockup Box */}
      <div style={{
        borderRadius: '16px',
        background: '#090d1a',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        {/* Editor tab bar */}
        <div style={{
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.78rem',
          color: '#94a3b8'
        }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          <span style={{ marginLeft: '12px', color: '#38bdf8', fontWeight: 600 }}>solution.{currentChallenge.language === 'Python' ? 'py' : 'js'}</span>
        </div>

        {/* Code body */}
        <pre style={{
          margin: 0,
          padding: '16px 20px',
          color: '#e2e8f0',
          fontFamily: "'Fira Code', 'Courier New', monospace",
          fontSize: '0.88rem',
          lineHeight: 1.55,
          overflowX: 'auto'
        }}>
          {currentChallenge.buggyCode}
        </pre>
      </div>

      {/* Failure Diagnostic Output */}
      <div style={{
        padding: '14px 18px',
        borderRadius: '14px',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        marginBottom: '20px',
        fontSize: '0.84rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 800, marginBottom: '4px' }}>
          <Bug size={16} /> Runtime Exception Diagnostic:
        </div>
        <div style={{ color: isLight ? '#334155' : '#cbd5e1' }}>
          <strong>Actual Output:</strong> {currentChallenge.actual}
        </div>
        <div style={{ color: '#10b981' }}>
          <strong>Expected:</strong> {currentChallenge.expected}
        </div>
      </div>

      {/* Test Execution Output */}
      {testResult && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: testResult.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${testResult.passed ? '#10b981' : '#ef4444'}`,
          color: testResult.passed ? '#10b981' : '#ef4444',
          fontWeight: 700,
          fontSize: '0.86rem',
          marginBottom: '20px'
        }}>
          {testResult.message}
        </div>
      )}

      {/* Fix Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
        {currentChallenge.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectFix(opt)}
            disabled={!!testResult || isPaused}
            style={{
              padding: '14px 18px',
              borderRadius: '14px',
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
              border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isLight ? '#0f172a' : '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: testResult ? 'default' : 'pointer',
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
    </div>
  );
};

export default CodeBreaker;
