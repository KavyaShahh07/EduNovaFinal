import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Zap, Flame, Check, RefreshCw, Award, Code } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

export const AlgorithmRace = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  // Array to sort via Bubble Sort interactive steps
  const [array, setArray] = useState([52, 28, 85, 14, 40, 66]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pass, setPass] = useState(0);
  const [swapsMade, setSwapsMade] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isSorted, setIsSorted] = useState(false);

  useEffect(() => {
    onChallengeChange({
      question: `Algorithm Race: Bubble Sort execution on [${array.join(', ')}]`
    });
  }, [array]);

  const handleDecision = (shouldSwap) => {
    if (isSorted || isPaused) return;

    const a = array[currentIdx];
    const b = array[currentIdx + 1];
    const actualShouldSwap = a > b;

    if (shouldSwap === actualShouldSwap) {
      soundManager.playCorrect();
      const points = 100 + (combo * 20);
      setScore(prev => prev + points);
      setCombo(prev => {
        const next = prev + 1;
        if (next % 3 === 0) soundManager.playCombo(next);
        return next;
      });
      onAttempt(null);

      // Perform swap if required
      let newArr = [...array];
      if (shouldSwap) {
        newArr[currentIdx] = b;
        newArr[currentIdx + 1] = a;
        setSwapsMade(prev => prev + 1);
        setArray(newArr);
      }

      // Advance pointer
      const nextIdx = currentIdx + 1;
      const maxIdxForPass = array.length - 2 - pass;

      if (nextIdx > maxIdxForPass) {
        // Pass completed
        const nextPass = pass + 1;
        setPass(nextPass);
        setCurrentIdx(0);

        // Check if fully sorted
        let sorted = true;
        for (let i = 0; i < newArr.length - 1; i++) {
          if (newArr[i] > newArr[i + 1]) {
            sorted = false;
            break;
          }
        }

        if (sorted || nextPass >= array.length - 1) {
          soundManager.playVictory();
          setIsSorted(true);
          setTimeout(finishGame, 1200);
        }
      } else {
        setCurrentIdx(nextIdx);
      }
    } else {
      soundManager.playWrong();
      setCombo(0);
      onAttempt({
        question: `Comparing [${a}] vs [${b}]`,
        userAnswer: shouldSwap ? 'Swap' : 'Keep',
        correctAnswer: actualShouldSwap ? 'Swap (since left > right)' : 'Keep (since left <= right)'
      });
    }
  };

  const finishGame = () => {
    onFinish({
      score: score + 200,
      accuracy: 94,
      durationSeconds: 35,
      combo,
      level: pass + 1,
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
          <Code size={18} /> Algorithm: Bubble Sort (Pass {pass + 1})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
          <Zap size={16} /> {score} pts
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Flame size={16} /> {combo}x Combo
        </div>
      </div>

      {/* Visual Array Bars Canvas */}
      <div style={{
        height: '240px',
        borderRadius: '18px',
        background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '20px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {array.map((val, idx) => {
          const isComparing = idx === currentIdx || idx === currentIdx + 1;
          const isSettled = idx >= array.length - pass;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                width: '60px'
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isComparing ? '#38bdf8' : isLight ? '#0f172a' : '#ffffff' }}>
                {val}
              </span>
              <div
                style={{
                  width: '100%',
                  height: `${val * 2}px`,
                  borderRadius: '10px 10px 4px 4px',
                  background: isComparing
                    ? 'linear-gradient(to top, #0284c7 0%, #38bdf8 100%)'
                    : isSettled
                    ? 'linear-gradient(to top, #059669 0%, #10b981 100%)'
                    : isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.15)',
                  boxShadow: isComparing ? '0 0 16px rgba(56, 189, 248, 0.6)' : 'none',
                  transition: 'height 0.25s ease, background 0.2s ease'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>[{idx}]</span>
            </div>
          );
        })}
      </div>

      {/* Comparison Instruction */}
      {!isSorted ? (
        <div style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
            Compare indices [{currentIdx}] and [{currentIdx + 1}]: {array[currentIdx]} vs {array[currentIdx + 1]}
          </div>
          <div style={{ fontSize: '0.84rem', color: isLight ? '#64748b' : '#94a3b8' }}>
            Should these two adjacent elements be swapped into ascending order?
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '16px',
          borderRadius: '14px',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          fontWeight: 800,
          marginBottom: '20px'
        }}>
          🎉 Array Successfully Sorted in O(n) swaps! Finalizing...
        </div>
      )}

      {/* Decision Controls */}
      {!isSorted && (
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => handleDecision(true)}
            disabled={isPaused}
            style={{
              flex: 1,
              maxWidth: '200px',
              padding: '14px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
            }}
          >
            <ArrowLeftRight size={16} /> SWAP Elements
          </button>

          <button
            onClick={() => handleDecision(false)}
            disabled={isPaused}
            style={{
              flex: 1,
              maxWidth: '200px',
              padding: '14px',
              borderRadius: '14px',
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
              border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isLight ? '#0f172a' : '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Check size={16} /> KEEP Order
          </button>
        </div>
      )}
    </div>
  );
};

export default AlgorithmRace;
