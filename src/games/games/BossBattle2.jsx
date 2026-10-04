import React, { useState, useEffect, useRef } from 'react';
import { Sword, Shield, Heart, Zap, Flame, Skull, Sparkles, AlertCircle } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

const BOSSES = [
  {
    id: 'math',
    name: 'Matrix Golem',
    title: 'Mathematics Overlord',
    maxHp: 400,
    color: '#f59e0b',
    avatar: '🗿',
    questions: [
      {
        question: 'Solve for x: 3x² - 12 = 0',
        options: ['x = ±2', 'x = ±4', 'x = 2 only', 'x = 3'],
        answer: 'x = ±2',
        damage: 100
      },
      {
        question: 'What is the derivative d/dx (x³ + 4x)?',
        options: ['3x² + 4', '3x + 4', 'x² + 4', '3x²'],
        answer: '3x² + 4',
        damage: 100
      },
      {
        question: 'Calculate the determinant of matrix [[2, 3], [1, 4]]:',
        options: ['5 (2×4 - 3×1)', '11', '8', '6'],
        answer: '5 (2×4 - 3×1)',
        damage: 100
      },
      {
        question: 'FINAL BLOW: If log₂(x) = 5, what is x?',
        options: ['32 (2⁵)', '10', '25', '64'],
        answer: '32 (2⁵)',
        damage: 150
      }
    ]
  },
  {
    id: 'physics',
    name: 'Quantum Colossus',
    title: 'Physics Titan',
    maxHp: 400,
    color: '#38bdf8',
    avatar: '⚡',
    questions: [
      {
        question: 'What is the SI unit of Magnetic Flux?',
        options: ['Weber (Wb)', 'Tesla (T)', 'Henry (H)', 'Lumen (lm)'],
        answer: 'Weber (Wb)',
        damage: 100
      },
      {
        question: 'Formula for Gravitational Potential Energy near Earth surface:',
        options: ['U = mgh', 'KE = ½mv²', 'F = G(m1m2)/r²', 'P = F·v'],
        answer: 'U = mgh',
        damage: 100
      },
      {
        question: 'In total internal reflection, angle of incidence must be:',
        options: ['Greater than critical angle', 'Less than critical angle', 'Exactly 45°', 'Equal to 90°'],
        answer: 'Greater than critical angle',
        damage: 100
      },
      {
        question: 'FINAL BLOW: Planck’s constant equation relating photon energy E to frequency f:',
        options: ['E = hf', 'E = mc²', 'E = ½hf', 'E = λ/f'],
        answer: 'E = hf',
        damage: 150
      }
    ]
  },
  {
    id: 'chemistry',
    name: 'Molecular Hydra',
    title: 'Chemistry Leviathan',
    maxHp: 400,
    color: '#10b981',
    avatar: '🐉',
    questions: [
      {
        question: 'What is the pH of a neutral aqueous solution at 25°C?',
        options: ['pH = 7', 'pH = 0', 'pH = 14', 'pH = 1'],
        answer: 'pH = 7',
        damage: 100
      },
      {
        question: 'Avogadro’s Law states equal volumes of gases at same T and P contain:',
        options: ['Equal number of molecules', 'Equal mass', 'Equal density', 'Equal speed'],
        answer: 'Equal number of molecules',
        damage: 100
      },
      {
        question: 'Which type of bond involves the sharing of electron pairs?',
        options: ['Covalent bond', 'Ionic bond', 'Metallic bond', 'Hydrogen dipole'],
        answer: 'Covalent bond',
        damage: 100
      },
      {
        question: 'FINAL BLOW: In an exothermic reaction, the enthalpy change ΔH is:',
        options: ['Negative (ΔH < 0)', 'Positive (ΔH > 0)', 'Zero', 'Infinite'],
        answer: 'Negative (ΔH < 0)',
        damage: 150
      }
    ]
  },
  {
    id: 'coding',
    name: 'Code Sentinel',
    title: 'Algorithmic Cyber-Dragon',
    maxHp: 400,
    color: '#8b5cf6',
    avatar: '👾',
    questions: [
      {
        question: 'Worst-case time complexity of QuickSort without random pivot:',
        options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
        answer: 'O(n²)',
        damage: 100
      },
      {
        question: 'In SQL, which clause is used to filter aggregated group results?',
        options: ['HAVING', 'WHERE', 'ORDER BY', 'LIMIT'],
        answer: 'HAVING',
        damage: 100
      },
      {
        question: 'Which data structure follows LIFO (Last-In First-Out)?',
        options: ['Stack', 'Queue', 'Array', 'Linked List'],
        answer: 'Stack',
        damage: 100
      },
      {
        question: 'FINAL BLOW: Which search algorithm works on sorted arrays in O(log n)?',
        options: ['Binary Search', 'Linear Search', 'Depth First Search', 'Breadth First Search'],
        answer: 'Binary Search',
        damage: 150
      }
    ]
  },
  {
    id: 'reasoning',
    name: 'Logic Archon',
    title: 'Deductive Sphinx',
    maxHp: 400,
    color: '#ec4899',
    avatar: '🔮',
    questions: [
      {
        question: 'If statement P → Q is true, its Contrapositive is:',
        options: ['¬Q → ¬P', 'Q → P', '¬P → ¬Q', 'P AND Q'],
        answer: '¬Q → ¬P',
        damage: 100
      },
      {
        question: 'A clock shows 3:15. What is the angle between hour and minute hands?',
        options: ['7.5°', '0°', '15°', '5°'],
        answer: '7.5°',
        damage: 100
      },
      {
        question: 'Which argument form is unconditionally valid?',
        options: ['Modus Ponens', 'Affirming Consequent', 'Denying Antecedent', 'Fallacy of Division'],
        answer: 'Modus Ponens',
        damage: 100
      },
      {
        question: 'FINAL BLOW: Complete the sequence: 1, 8, 27, 64, 125, ?',
        options: ['216 (6³)', '200', '256', '343'],
        answer: '216 (6³)',
        damage: 150
      }
    ]
  }
];

export const BossBattle2 = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [selectedBossIdx, setSelectedBossIdx] = useState(0);
  const activeBoss = BOSSES[selectedBossIdx];

  const [bossHp, setBossHp] = useState(activeBoss.maxHp);
  const [playerHp, setPlayerHp] = useState(3);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bossShake, setBossShake] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);

  const currentQ = activeBoss.questions[qIndex] || activeBoss.questions[0];

  useEffect(() => {
    onChallengeChange({
      question: `Boss Battle: ${activeBoss.name} — ${currentQ.question}`
    });
  }, [selectedBossIdx, qIndex]);

  const handleAttack = (opt) => {
    if (bossHp <= 0 || playerHp <= 0 || isPaused) return;

    const isCorrect = opt === currentQ.answer;

    if (isCorrect) {
      soundManager.playLaser();
      setBossShake(true);
      setTimeout(() => setBossShake(false), 300);

      const dealtDmg = currentQ.damage + (combo * 20);
      const nextHp = Math.max(0, bossHp - dealtDmg);
      setBossHp(nextHp);

      const points = 150 + (combo * 30);
      setScore(prev => prev + points);
      setCombo(prev => {
        const next = prev + 1;
        if (next % 2 === 0) soundManager.playCombo(next);
        return next;
      });
      onAttempt(null);

      if (nextHp <= 0) {
        // Boss Defeated!
        soundManager.playVictory();
        setTimeout(finishBattle, 1200);
      } else {
        setQIndex(prev => Math.min(activeBoss.questions.length - 1, prev + 1));
      }
    } else {
      // Boss counter-attacks player!
      soundManager.playWrong();
      setCombo(0);
      setPlayerHit(true);
      setTimeout(() => setPlayerHit(false), 300);

      const nextPlayerHp = playerHp - 1;
      setPlayerHp(nextPlayerHp);

      onAttempt({
        question: `${activeBoss.name}: ${currentQ.question}`,
        userAnswer: opt,
        correctAnswer: currentQ.answer
      });

      if (nextPlayerHp <= 0) {
        setTimeout(finishBattle, 800);
      }
    }
  };

  const finishBattle = () => {
    onFinish({
      score: score + (bossHp <= 0 ? 300 : 0),
      accuracy: bossHp <= 0 ? 95 : 60,
      durationSeconds: 45,
      combo,
      level: qIndex + 1,
      completed: bossHp <= 0
    });
  };

  const phase = bossHp > 200 ? 'PHASE 1: AWAKENING' : bossHp > 100 ? 'PHASE 2: ENRAGED' : 'FINAL PHASE: CRITICAL OVERLOAD';

  return (
    <div style={{
      width: '100%',
      maxWidth: '820px',
      margin: '0 auto',
      background: 'radial-gradient(ellipse at 50% 20%, #1e112a 0%, #030712 95%)',
      borderRadius: '24px',
      border: '1.5px solid rgba(236, 72, 153, 0.4)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      padding: '24px',
      color: '#ffffff',
      userSelect: 'none'
    }}>
      {/* Top HUD */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '12px 18px',
        borderRadius: '16px',
        background: 'rgba(0, 0, 0, 0.4)',
        fontSize: '0.88rem',
        fontWeight: 700
      }}>
        {/* Boss Switcher */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {BOSSES.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBossIdx(idx);
                setBossHp(b.maxHp);
                setQIndex(0);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                background: selectedBossIdx === idx ? `${b.color}33` : 'rgba(255, 255, 255, 0.05)',
                border: selectedBossIdx === idx ? `1.5px solid ${b.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                color: selectedBossIdx === idx ? b.color : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              {b.avatar} {b.name}
            </button>
          ))}
        </div>

        {/* Player Shield & Combo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                size={18}
                color="#ec4899"
                fill={i < playerHp ? '#ec4899' : 'none'}
              />
            ))}
          </div>
          <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={16} /> {combo}x
          </div>
          <div style={{ color: '#38bdf8' }}>{score} pts</div>
        </div>
      </div>

      {/* Boss Stage Visual Area */}
      <div style={{
        padding: '24px',
        borderRadius: '20px',
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        {/* Boss Avatar & Title */}
        <div style={{
          fontSize: '4.5rem',
          filter: bossShake ? 'drop-shadow(0 0 25px #ef4444)' : `drop-shadow(0 0 25px ${activeBoss.color})`,
          transform: bossShake ? 'translateX(-6px)' : 'none',
          transition: 'transform 0.1s ease',
          marginBottom: '8px'
        }}>
          {bossHp <= 0 ? '💥' : activeBoss.avatar}
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 4px 0', color: activeBoss.color }}>
          {activeBoss.name}
        </h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f43f5e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {phase}
        </span>

        {/* Boss Health Bar */}
        <div style={{ width: '100%', maxWidth: '420px', height: '14px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.1)', margin: '14px auto 0', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <div style={{
            width: `${(bossHp / activeBoss.maxHp) * 100}%`,
            height: '100%',
            background: 'linear-gradient(to right, #ec4899 0%, #ef4444 100%)',
            boxShadow: '0 0 14px #ec4899',
            transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
          Boss Health: {bossHp} / {activeBoss.maxHp} HP
        </div>
      </div>

      {/* Educational Attack Challenge */}
      {bossHp > 0 && playerHp > 0 ? (
        <div>
          <div style={{
            padding: '14px 18px',
            borderRadius: '14px',
            background: 'rgba(236, 72, 153, 0.12)',
            border: '1px solid rgba(236, 72, 153, 0.25)',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ec4899', textTransform: 'uppercase' }}>
              CAST ATTACK SPELL: SOLVE CHALLENGE
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '4px' }}>
              {currentQ.question}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAttack(opt)}
                disabled={isPaused}
                style={{
                  padding: '14px 18px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.12s ease'
                }}
              >
                <Sword size={14} color="#ec4899" />
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: bossHp <= 0 ? '#10b981' : '#ef4444' }}>
            {bossHp <= 0 ? '🏆 BOSS DEFEATED! LEARNING VICTORY!' : '💀 SHIELD DEPLETED — REARM FOR BATTLE'}
          </h3>
        </div>
      )}
    </div>
  );
};

export default BossBattle2;
