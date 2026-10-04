import React, { useState, useEffect } from 'react';
import { Vault, KeyRound, Shield, Clock, Zap, Flame, Check, Lock } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

const VAULT_CHAMBERS = [
  {
    chamberId: 'VAL-01',
    title: 'Relativistic Quantum Vault',
    classifiedFact: 'Speed of Light in Vacuum: c = 299,792,458 m/s',
    passcodeKey: '299792',
    prompt: 'Enter the first 6 digits of the speed of light constant (c) memorized from the vault file:',
    options: ['299792', '314159', '287500', '300000']
  },
  {
    chamberId: 'VAL-02',
    title: 'Thermodynamics Cryo-Chamber',
    classifiedFact: 'Absolute Zero Kelvin in Celsius: -273.15 °C',
    passcodeKey: '-273.15',
    prompt: 'Recall the exact Celsius temperature of Absolute Zero (0 Kelvin):',
    options: ['-273.15 °C', '-250.00 °C', '-300.25 °C', '-212.00 °C']
  },
  {
    chamberId: 'VAL-03',
    title: 'Atomic Avogadro Strongroom',
    classifiedFact: 'Avogadro Constant: 6.022 × 10²³ particles/mol',
    passcodeKey: '6.022 × 10²³',
    prompt: 'What is Avogadro’s number representing 1 mole of substance?',
    options: ['6.022 × 10²³', '3.141 × 10¹²', '1.602 × 10⁻¹⁹', '9.810 × 10⁸']
  }
];

export const MemoryVault = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [chamberIdx, setChamberIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [phase, setPhase] = useState('BRIEFING'); // 'BRIEFING' | 'RECALL' | 'UNLOCKED'
  const [countdown, setCountdown] = useState(5);

  const currentChamber = VAULT_CHAMBERS[chamberIdx];

  useEffect(() => {
    onChallengeChange({ question: `${currentChamber.title}: Memorize ${currentChamber.classifiedFact}` });
    setPhase('BRIEFING');
    setCountdown(5);
  }, [chamberIdx]);

  // Briefing countdown timer
  useEffect(() => {
    if (phase !== 'BRIEFING' || isPaused) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('RECALL');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isPaused]);

  const handleSelectPasscode = (opt) => {
    if (phase !== 'RECALL' || isPaused) return;

    const isCorrect = opt === currentChamber.passcodeKey;

    if (isCorrect) {
      soundManager.playCorrect();
      setPhase('UNLOCKED');
      const points = 150 + (combo * 30);
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      onAttempt(null);

      setTimeout(() => {
        if (chamberIdx + 1 < VAULT_CHAMBERS.length) {
          setChamberIdx(prev => prev + 1);
        } else {
          finishVault();
        }
      }, 1500);
    } else {
      soundManager.playWrong();
      setCombo(0);
      onAttempt({
        question: currentChamber.prompt,
        userAnswer: opt,
        correctAnswer: currentChamber.passcodeKey
      });
    }
  };

  const finishVault = () => {
    onFinish({
      score,
      accuracy: 94,
      durationSeconds: 35,
      combo,
      level: chamberIdx + 1,
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
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(168, 85, 247, 0.4)',
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
          <Vault size={18} /> Vault Sector {chamberIdx + 1}/{VAULT_CHAMBERS.length} [{currentChamber.chamberId}]
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
          <Zap size={16} /> {score} pts
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Flame size={16} /> {combo}x Combo
        </div>
      </div>

      {/* Briefing Phase: Show Classified Fact */}
      {phase === 'BRIEFING' && (
        <div style={{
          padding: '28px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(56, 189, 248, 0.1) 100%)',
          border: '1.5px solid rgba(168, 85, 247, 0.4)',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            <Clock size={16} /> Memorize Before Door Seals ({countdown}s)
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#c084fc', margin: '0 0 8px 0' }}>
            {currentChamber.classifiedFact}
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8' }}>
            This constant will be sealed once the biometric countdown expires.
          </p>
        </div>
      )}

      {/* Recall Phase: Enter Code */}
      {(phase === 'RECALL' || phase === 'UNLOCKED') && (
        <div>
          <div style={{
            padding: '20px',
            borderRadius: '16px',
            background: phase === 'UNLOCKED' ? 'rgba(16, 185, 129, 0.15)' : isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${phase === 'UNLOCKED' ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: phase === 'UNLOCKED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              {phase === 'UNLOCKED' ? <Check size={28} color="#10b981" /> : <Lock size={28} color="#c084fc" />}
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0' }}>
              {phase === 'UNLOCKED' ? 'Biometric Lock Disengaged!' : currentChamber.prompt}
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {currentChamber.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPasscode(opt)}
                disabled={phase === 'UNLOCKED' || isPaused}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                  border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.12)',
                  color: isLight ? '#0f172a' : '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: phase === 'UNLOCKED' ? 'default' : 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryVault;
