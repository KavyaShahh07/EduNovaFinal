import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Flame, Check, AlertTriangle, Play, ToggleLeft, ToggleRight, Lightbulb } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

const CIRCUIT_STAGES = [
  {
    stage: 1,
    title: 'Basic DC Loop & Current Limiting',
    voltage: 9, // Volts
    ledMaxCurrent: 0.03, // 30mA max (Amperes)
    prompt: 'You have a 9V DC battery powering a 3V LED (forward drop 3V, so net voltage = 6V). Max safe current is 30mA (0.03A). By Ohm’s Law R = V / I, what minimum resistor is needed to prevent LED burnout?',
    options: ['200 Ω (R = 6V / 0.03A)', '50 Ω', '10 Ω', '5000 Ω'],
    answer: '200 Ω (R = 6V / 0.03A)',
    explanation: 'By Ohm’s Law, R = ΔV / I = (9V - 3V) / 0.03A = 200 Ohms.'
  },
  {
    stage: 2,
    title: 'Series vs Parallel Resistance',
    voltage: 12,
    prompt: 'Two 100 Ω resistors are placed in PARALLEL. What is the equivalent total resistance (R_eq)?',
    options: ['50 Ω (1/Req = 1/100 + 1/100)', '200 Ω', '100 Ω', '25 Ω'],
    answer: '50 Ω (1/Req = 1/100 + 1/100)',
    explanation: 'For two identical parallel resistors, equivalent resistance is R/2 = 100/2 = 50 Ohms.'
  },
  {
    stage: 3,
    title: 'Logic Gate Switch Inverter',
    voltage: 5,
    prompt: 'A transistor switch is configured as a NOT inverter gate. When the base input is HIGH (1), the output across the collector-emitter is:',
    options: ['LOW (0V / OFF)', 'HIGH (5V / ON)', 'PULSING', 'OSCILLATING'],
    answer: 'LOW (0V / OFF)',
    explanation: 'A NOT gate inverts the logic state: HIGH input pulls the collector output to LOW (ground).'
  }
];

export const CircuitBreaker = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [switchClosed, setSwitchClosed] = useState(false);
  const [circuitEnergized, setCircuitEnergized] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const currentStage = CIRCUIT_STAGES[stageIdx];

  useEffect(() => {
    onChallengeChange({ question: `${currentStage.title}: ${currentStage.prompt}` });
    setSwitchClosed(false);
    setCircuitEnergized(false);
    setStatusMessage(null);
  }, [stageIdx]);

  const handleSelectOption = (opt) => {
    if (circuitEnergized || isPaused) return;

    const isCorrect = opt === currentStage.answer;

    if (isCorrect) {
      soundManager.playCorrect();
      setSwitchClosed(true);
      setCircuitEnergized(true);
      const points = 150 + (combo * 30);
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      onAttempt(null);

      setStatusMessage({
        success: true,
        text: '⚡ CIRCUIT CLOSED: Optimal current flowing! LED illuminated at 100% luminance.'
      });

      setTimeout(() => {
        if (stageIdx + 1 < CIRCUIT_STAGES.length) {
          setStageIdx(prev => prev + 1);
        } else {
          finishGame();
        }
      }, 1600);
    } else {
      soundManager.playWrong();
      setCombo(0);
      onAttempt({
        question: currentStage.prompt,
        userAnswer: opt,
        correctAnswer: currentStage.answer
      });

      setStatusMessage({
        success: false,
        text: '⚠️ RESISTANCE MISMATCH: Current violated tolerance parameters!'
      });
    }
  };

  const finishGame = () => {
    onFinish({
      score,
      accuracy: 92,
      durationSeconds: 40,
      combo,
      level: stageIdx + 1,
      completed: true
    });
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
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
          <Cpu size={18} /> Circuit Stage {stageIdx + 1}/{CIRCUIT_STAGES.length}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
          <Zap size={16} /> {score} pts
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Flame size={16} /> {combo}x Combo
        </div>
      </div>

      {/* Schematic Diagram Canvas Box */}
      <div style={{
        height: '180px',
        borderRadius: '18px',
        background: '#090d1a',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: '20px',
        position: 'relative'
      }}>
        {/* Battery node */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', border: '2px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#38bdf8', margin: '0 auto 6px' }}>
            {currentStage.voltage}V
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>DC Battery</span>
        </div>

        {/* Wire indicator */}
        <div style={{ height: '3px', flex: 1, background: circuitEnergized ? '#10b981' : '#334155', boxShadow: circuitEnergized ? '0 0 10px #10b981' : 'none', margin: '0 10px' }} />

        {/* Switch node */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: switchClosed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)', border: `2px solid ${switchClosed ? '#10b981' : '#64748b'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
            {switchClosed ? <ToggleRight size={26} color="#10b981" /> : <ToggleLeft size={26} color="#64748b" />}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{switchClosed ? 'CLOSED' : 'OPEN'}</span>
        </div>

        {/* Wire indicator */}
        <div style={{ height: '3px', flex: 1, background: circuitEnergized ? '#10b981' : '#334155', boxShadow: circuitEnergized ? '0 0 10px #10b981' : 'none', margin: '0 10px' }} />

        {/* LED node */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: circuitEnergized ? 'radial-gradient(circle, #34d399 0%, #059669 80%)' : 'rgba(255, 255, 255, 0.05)',
            border: `2px solid ${circuitEnergized ? '#34d399' : '#64748b'}`,
            boxShadow: circuitEnergized ? '0 0 25px #34d399, 0 0 45px #10b981' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 6px'
          }}>
            <Lightbulb size={24} color={circuitEnergized ? '#ffffff' : '#64748b'} />
          </div>
          <span style={{ fontSize: '0.72rem', color: circuitEnergized ? '#34d399' : '#94a3b8' }}>{circuitEnergized ? 'ACTIVE' : 'OFF'}</span>
        </div>
      </div>

      {/* Challenge Prompt */}
      <p style={{ fontSize: '0.98rem', fontWeight: 600, margin: '0 0 20px 0', lineHeight: 1.5 }}>
        {currentStage.prompt}
      </p>

      {/* Status banner */}
      {statusMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: statusMessage.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${statusMessage.success ? '#10b981' : '#ef4444'}`,
          color: statusMessage.success ? '#10b981' : '#ef4444',
          fontWeight: 700,
          fontSize: '0.86rem',
          marginBottom: '20px'
        }}>
          {statusMessage.text}
        </div>
      )}

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {currentStage.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectOption(opt)}
            disabled={circuitEnergized || isPaused}
            style={{
              padding: '14px 18px',
              borderRadius: '14px',
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
              border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isLight ? '#0f172a' : '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: circuitEnergized ? 'default' : 'pointer',
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

export default CircuitBreaker;
