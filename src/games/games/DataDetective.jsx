import React, { useState, useEffect } from 'react';
import { Search, BarChart3, TrendingUp, Zap, Flame, CheckCircle, ShieldAlert, Award } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

const DATA_CASES = [
  {
    caseId: 1,
    title: 'Case #101: The Quarter Surge Anomaly',
    clue: 'Investigate quarterly revenue ($M). Click on the quarter that achieved the LARGEST single-quarter growth leap:',
    bars: [
      { label: 'Q1', value: 40, growth: 0 },
      { label: 'Q2', value: 45, growth: 5 },
      { label: 'Q3', value: 75, growth: 30 }, // Largest surge (+30)
      { label: 'Q4', value: 85, growth: 10 }
    ],
    correctLabel: 'Q3',
    explanation: 'Q3 jumped from $45M to $75M (a +$30M leap, the highest marginal increase).'
  },
  {
    caseId: 2,
    title: 'Case #102: Telemetry Outlier Detection',
    clue: 'Examine server latency spikes across hourly samples. Click the suspicious statistical OUTLIER:',
    bars: [
      { label: '12:00', value: 42 },
      { label: '13:00', value: 48 },
      { label: '14:00', value: 195 }, // Extreme outlier
      { label: '15:00', value: 44 }
    ],
    correctLabel: '14:00',
    explanation: '14:00 registered 195ms latency, exceeding 3 standard deviations from the normal 45ms baseline.'
  },
  {
    caseId: 3,
    title: 'Case #103: Minimum Energy Deficit',
    clue: 'Identify the lunar solar collector array operating at the LOWEST battery charge capacity:',
    bars: [
      { label: 'Panel Alpha', value: 68 },
      { label: 'Panel Beta', value: 22 }, // Lowest
      { label: 'Panel Gamma', value: 55 },
      { label: 'Panel Delta', value: 89 }
    ],
    correctLabel: 'Panel Beta',
    explanation: 'Panel Beta is operating at only 22% charge capacity, indicating photovoltaic occlusion.'
  }
];

export const DataDetective = ({
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
  const [investigatedCount, setInvestigatedCount] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const currentCase = DATA_CASES[caseIdx];

  useEffect(() => {
    onChallengeChange({ question: `${currentCase.title}: ${currentCase.clue}` });
    setFeedback(null);
  }, [caseIdx]);

  const handleBarClick = (bar) => {
    if (feedback || isPaused) return;

    const isCorrect = bar.label === currentCase.correctLabel;

    if (isCorrect) {
      soundManager.playCorrect();
      const points = 150 + (combo * 30);
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      setInvestigatedCount(prev => prev + 1);
      onAttempt(null);

      setFeedback({
        isSuccess: true,
        text: `EVIDENCE CONFIRMED: ${currentCase.explanation}`
      });

      setTimeout(() => {
        if (caseIdx + 1 < DATA_CASES.length) {
          setCaseIdx(prev => prev + 1);
        } else {
          finishGame();
        }
      }, 1500);
    } else {
      soundManager.playWrong();
      setCombo(0);
      onAttempt({
        question: currentCase.clue,
        userAnswer: bar.label,
        correctAnswer: currentCase.correctLabel
      });

      setFeedback({
        isSuccess: false,
        text: `INCORRECT ELEMENT: Re-evaluate bar values and relative differentials carefully.`
      });
    }
  };

  const finishGame = () => {
    onFinish({
      score,
      accuracy: 94,
      durationSeconds: 40,
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
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(56, 189, 248, 0.35)',
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
          <Search size={18} /> {currentCase.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
          <Zap size={16} /> {score} pts
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Flame size={16} /> {combo}x Combo
        </div>
      </div>

      {/* Clue Prompt */}
      <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 24px 0', lineHeight: 1.5, color: isLight ? '#334155' : '#cbd5e1' }}>
        {currentCase.clue}
      </p>

      {/* Interactive Chart Canvas */}
      <div style={{
        height: '240px',
        borderRadius: '18px',
        background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px 20px 16px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {currentCase.bars.map((bar, idx) => (
          <button
            key={idx}
            onClick={() => handleBarClick(bar)}
            disabled={!!feedback || isPaused}
            style={{
              flex: 1,
              maxWidth: '100px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: feedback ? 'default' : 'pointer',
              outline: 'none',
              transition: 'transform 0.15s ease'
            }}
          >
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff' }}>
              {bar.value}
            </span>
            <div
              style={{
                width: '100%',
                height: `${bar.value * 0.9}px`,
                maxHeight: '160px',
                borderRadius: '12px 12px 4px 4px',
                background: 'linear-gradient(to top, #0284c7 0%, #38bdf8 100%)',
                boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)',
                transition: 'filter 0.2s ease, transform 0.2s ease'
              }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
              {bar.label}
            </span>
          </button>
        ))}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div style={{
          padding: '14px',
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

export default DataDetective;
