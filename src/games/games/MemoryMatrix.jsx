import React, { useState, useEffect, useRef } from 'react';
import { Layers, Zap, Clock, Trophy, Flame, CheckCircle, RefreshCw } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

export const MemoryMatrix = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [gridSize, setGridSize] = useState(3); // 3x3 -> 4x4 -> 5x5 -> 6x6
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const [phase, setPhase] = useState('MEMORIZE'); // 'MEMORIZE' | 'RECALL' | 'FAILED'
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctSequences, setCorrectSequences] = useState(0);
  const [maxSeqLength, setMaxSeqLength] = useState(0);

  const isPlayingSeqRef = useRef(false);

  // Generate sequence for current level
  const startLevel = (currentLvl) => {
    // Determine grid dimension: 1-3 -> 3x3, 4-7 -> 4x4, 8-11 -> 5x5, 12+ -> 6x6
    let dimension = 3;
    if (currentLvl >= 12) dimension = 6;
    else if (currentLvl >= 8) dimension = 5;
    else if (currentLvl >= 4) dimension = 4;
    setGridSize(dimension);

    const totalCells = dimension * dimension;
    const seqLength = 3 + Math.floor(currentLvl * 0.75);
    setMaxSeqLength(prev => Math.max(prev, seqLength));

    const newSeq = [];
    for (let i = 0; i < seqLength; i++) {
      newSeq.push(Math.floor(Math.random() * totalCells));
    }

    setSequence(newSeq);
    setPlayerInput([]);
    setPhase('MEMORIZE');
    onChallengeChange({ question: `Memory Matrix: Sequence Length ${seqLength} (${dimension}x${dimension} Grid)` });

    playSequence(newSeq, dimension);
  };

  const playSequence = (seq, dimension) => {
    isPlayingSeqRef.current = true;
    let step = 0;
    const delay = Math.max(380, 750 - level * 30);

    const interval = setInterval(() => {
      if (step >= seq.length) {
        clearInterval(interval);
        setActiveCell(null);
        isPlayingSeqRef.current = false;
        setPhase('RECALL');
        return;
      }

      const cellIndex = seq[step];
      setActiveCell(cellIndex);
      soundManager.playTone(350 + (cellIndex * 25), 'triangle', 0.18, 0.15);
      step++;
    }, delay);
  };

  useEffect(() => {
    startLevel(1);
  }, []);

  const handleCellClick = (index) => {
    if (phase !== 'RECALL' || isPlayingSeqRef.current || isPaused) return;

    soundManager.playTone(350 + (index * 25), 'sine', 0.15, 0.12);
    const nextInput = [...playerInput, index];
    setPlayerInput(nextInput);

    const currentStep = playerInput.length;
    const isCorrectStep = sequence[currentStep] === index;

    if (!isCorrectStep) {
      // Mistake made
      soundManager.playWrong();
      setCombo(0);
      setTotalAttempts(prev => prev + 1);
      onAttempt({
        question: `Memory Sequence Step #${currentStep + 1}`,
        userAnswer: `Cell index ${index}`,
        correctAnswer: `Cell index ${sequence[currentStep]}`
      });

      setPhase('FAILED');
      setTimeout(() => {
        if (level > 1 && totalAttempts >= 3) {
          finishGame();
        } else {
          startLevel(level); // Retry level
        }
      }, 1200);
      return;
    }

    // Correct step
    if (nextInput.length === sequence.length) {
      // Completed full sequence!
      soundManager.playCorrect();
      const points = 120 + (combo * 30) + (sequence.length * 20);
      setScore(prev => prev + points);
      setCombo(prev => {
        const next = prev + 1;
        if (next % 3 === 0) soundManager.playCombo(next);
        return next;
      });
      setCorrectSequences(prev => prev + 1);
      setTotalAttempts(prev => prev + 1);
      onAttempt(null);

      const nextLevel = level + 1;
      setLevel(nextLevel);
      setTimeout(() => {
        startLevel(nextLevel);
      }, 800);
    }
  };

  const finishGame = () => {
    const accuracy = totalAttempts > 0 ? Math.round((correctSequences / totalAttempts) * 100) : 100;
    onFinish({
      score,
      accuracy,
      durationSeconds: Math.min(90, level * 10),
      combo,
      level,
      stats: { maxSequenceLength: maxSeqLength, levelReached: level }
    });
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '680px',
      margin: '0 auto',
      background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 15, 36, 0.92)',
      borderRadius: '24px',
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(168, 85, 247, 0.3)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* HUD Bar */}
      <div style={{
        width: '100%',
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
          <Layers size={18} /> Level {level} ({gridSize}×{gridSize})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
          <Zap size={16} /> Score: {score}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Flame size={16} /> {combo}x Combo
        </div>
      </div>

      {/* Phase status indicator */}
      <div style={{
        marginBottom: '20px',
        fontSize: '0.92rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        color: phase === 'MEMORIZE' ? '#38bdf8' : phase === 'RECALL' ? '#10b981' : '#ef4444',
        background: phase === 'MEMORIZE' ? 'rgba(56, 189, 248, 0.15)' : phase === 'RECALL' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
        padding: '6px 16px',
        borderRadius: '9999px',
        border: `1px solid ${phase === 'MEMORIZE' ? '#38bdf8' : phase === 'RECALL' ? '#10b981' : '#ef4444'}55`
      }}>
        {phase === 'MEMORIZE' ? '🧠 OBSERVE THE PATTERN...' : phase === 'RECALL' ? `⚡ REPRODUCE: ${playerInput.length}/${sequence.length}` : '❌ PATTERN MISMATCH'}
      </div>

      {/* Grid Canvas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: '10px',
        width: '100%',
        maxWidth: `${gridSize * 70}px`,
        aspectRatio: '1 / 1',
        marginBottom: '24px'
      }}>
        {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
          const isGlowing = activeCell === idx;
          const isPlayerClicked = playerInput.includes(idx);

          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={phase !== 'RECALL' || isPaused}
              style={{
                borderRadius: '16px',
                background: isGlowing
                  ? 'linear-gradient(135deg, #c084fc 0%, #38bdf8 100%)'
                  : isPlayerClicked
                  ? 'rgba(168, 85, 247, 0.35)'
                  : isLight ? 'rgba(240, 246, 255, 0.85)' : 'rgba(255, 255, 255, 0.05)',
                border: isGlowing
                  ? '2px solid #ffffff'
                  : isLight ? '1px solid rgba(200, 220, 240, 0.8)' : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isGlowing
                  ? '0 0 25px rgba(192, 132, 252, 0.9), inset 0 0 10px #ffffff'
                  : 'none',
                cursor: phase === 'RECALL' ? 'pointer' : 'default',
                transform: isGlowing ? 'scale(0.96)' : 'scale(1)',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                outline: 'none'
              }}
            />
          );
        })}
      </div>

      {/* Bottom controls */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={finishGame}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Finish Session
        </button>
      </div>
    </div>
  );
};

export default MemoryMatrix;
