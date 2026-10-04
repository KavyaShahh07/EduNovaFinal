import React, { useState, useEffect } from 'react';
import { FlaskConical, Atom, Plus, Check, RefreshCw, Zap, Flame, Award } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

const MOLECULES_TO_SYNTHESIZE = [
  {
    formula: 'H₂O',
    name: 'Water',
    description: 'Universal solvent formed by 2 Hydrogen atoms and 1 Oxygen atom.',
    required: { H: 2, O: 1 },
    bonds: '2 Single Covalent Bonds',
    reactionEq: '2H₂ + O₂ → 2H₂O'
  },
  {
    formula: 'CO₂',
    name: 'Carbon Dioxide',
    description: 'Linear molecule with 1 Carbon atom double-bonded to 2 Oxygen atoms.',
    required: { C: 1, O: 2 },
    bonds: '2 Double Covalent Bonds (O=C=O)',
    reactionEq: 'C + O₂ → CO₂'
  },
  {
    formula: 'CH₄',
    name: 'Methane',
    description: 'Simplest alkane hydrocarbon with tetrahedral geometry.',
    required: { C: 1, H: 4 },
    bonds: '4 Single C-H Bonds',
    reactionEq: 'C + 2H₂ → CH₄'
  },
  {
    formula: 'NH₃',
    name: 'Ammonia',
    description: 'Trigonal pyramidal molecule synthesized from 1 Nitrogen and 3 Hydrogen atoms.',
    required: { N: 1, H: 3 },
    bonds: '3 Single N-H Polar Covalent Bonds',
    reactionEq: 'N₂ + 3H₂ → 2NH₃'
  },
  {
    formula: 'NaCl',
    name: 'Sodium Chloride (Table Salt)',
    description: 'Ionic compound formed by electron transfer from Na to Cl.',
    required: { Na: 1, Cl: 1 },
    bonds: 'Ionic Lattice Bond (Na⁺ Cl⁻)',
    reactionEq: '2Na + Cl₂ → 2NaCl'
  },
  {
    formula: 'HCl',
    name: 'Hydrochloric Acid',
    description: 'Strong binary acid formed by covalent electron sharing between H and Cl.',
    required: { H: 1, Cl: 1 },
    bonds: '1 Polar Covalent Bond (H-Cl)',
    reactionEq: 'H₂ + Cl₂ → 2HCl'
  }
];

const AVAILABLE_ATOMS = [
  { symbol: 'H', name: 'Hydrogen', valence: 1, color: '#38bdf8' },
  { symbol: 'O', name: 'Oxygen', valence: 2, color: '#ef4444' },
  { symbol: 'C', name: 'Carbon', valence: 4, color: '#64748b' },
  { symbol: 'N', name: 'Nitrogen', valence: 3, color: '#a855f7' },
  { symbol: 'Na', name: 'Sodium', valence: 1, color: '#f59e0b' },
  { symbol: 'Cl', name: 'Chlorine', valence: 1, color: '#10b981' }
];

export const ChemicalReactor = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [moleculeIndex, setMoleculeIndex] = useState(0);
  const [reactorAtoms, setReactorAtoms] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [synthesizedCount, setSynthesizedCount] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const targetMolecule = MOLECULES_TO_SYNTHESIZE[moleculeIndex];

  useEffect(() => {
    onChallengeChange({
      question: `Synthesize ${targetMolecule.name} (${targetMolecule.formula}) in the Chemical Reactor`
    });
    setReactorAtoms([]);
    setFeedback(null);
  }, [moleculeIndex]);

  const handleAddAtom = (atom) => {
    if (feedback || isPaused) return;
    soundManager.playTone(400 + reactorAtoms.length * 50, 'sine', 0.12, 0.12);
    setReactorAtoms(prev => [...prev, atom.symbol]);
  };

  const handleClearReactor = () => {
    soundManager.playClick();
    setReactorAtoms([]);
  };

  const handleSynthesize = () => {
    if (reactorAtoms.length === 0 || isPaused) return;

    // Count atom occurrences
    const counts = {};
    for (const sym of reactorAtoms) {
      counts[sym] = (counts[sym] || 0) + 1;
    }

    // Check if matches required
    const req = targetMolecule.required;
    const reqKeys = Object.keys(req);
    const atomKeys = Object.keys(counts);

    let isMatch = reqKeys.length === atomKeys.length;
    if (isMatch) {
      for (const k of reqKeys) {
        if (counts[k] !== req[k]) {
          isMatch = false;
          break;
        }
      }
    }

    if (isMatch) {
      soundManager.playCorrect();
      const added = 150 + (combo * 30);
      setScore(prev => prev + added);
      setCombo(prev => prev + 1);
      setSynthesizedCount(prev => prev + 1);
      onAttempt(null);

      setFeedback({
        isSuccess: true,
        text: `Molecule ${targetMolecule.formula} Synthesized! ${targetMolecule.bonds}`
      });

      setTimeout(() => {
        if (moleculeIndex + 1 < MOLECULES_TO_SYNTHESIZE.length) {
          setMoleculeIndex(prev => prev + 1);
        } else {
          finishGame();
        }
      }, 1400);
    } else {
      soundManager.playWrong();
      setCombo(0);
      onAttempt({
        question: `Synthesize ${targetMolecule.name} (${targetMolecule.formula})`,
        userAnswer: reactorAtoms.join(' + '),
        correctAnswer: Object.entries(req).map(([k, v]) => `${v}${k}`).join(' + ')
      });

      setFeedback({
        isSuccess: false,
        text: `Incorrect stoichiometry! Required: ${Object.entries(req).map(([k, v]) => `${v} of ${k}`).join(', ')}`
      });
    }
  };

  const finishGame = () => {
    onFinish({
      score,
      accuracy: 95,
      durationSeconds: 45,
      combo,
      level: moleculeIndex + 1,
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
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(16, 185, 129, 0.4)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      padding: '24px',
      color: isLight ? '#0f172a' : '#ffffff'
    }}>
      {/* Top HUD */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
          <FlaskConical size={18} /> Reaction Chamber ({moleculeIndex + 1}/{MOLECULES_TO_SYNTHESIZE.length})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
          <Zap size={16} /> {score} pts
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Flame size={16} /> {combo}x Combo
        </div>
      </div>

      {/* Target Molecule Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 24px',
        borderRadius: '18px',
        background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        marginBottom: '20px'
      }}>
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
            Target Synthesis Objective
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '2px 0 4px 0', color: isLight ? '#0f172a' : '#ffffff' }}>
            {targetMolecule.name} ({targetMolecule.formula})
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8' }}>
            {targetMolecule.description}
          </p>
        </div>

        <div style={{
          padding: '8px 14px',
          borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          fontWeight: 800,
          fontSize: '0.85rem'
        }}>
          {targetMolecule.reactionEq}
        </div>
      </div>

      {/* Reactor Mixing Chamber */}
      <div style={{
        minHeight: '140px',
        borderRadius: '18px',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.12) 0%, rgba(5, 10, 26, 0.8) 100%)',
        border: '2px dashed rgba(16, 185, 129, 0.4)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '20px'
      }}>
        {reactorAtoms.length === 0 ? (
          <span style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Reactor chamber is empty. Add element tokens below to construct molecular bonds.
          </span>
        ) : (
          reactorAtoms.map((sym, i) => {
            const atomInfo = AVAILABLE_ATOMS.find(a => a.symbol === sym);
            return (
              <div
                key={i}
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${atomInfo?.color || '#38bdf8'} 70%)`,
                  border: '2px solid #ffffff',
                  boxShadow: `0 0 15px ${atomInfo?.color || '#38bdf8'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  color: '#ffffff',
                  animation: 'scaleIn 0.2s ease'
                }}
              >
                {sym}
              </div>
            );
          })
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '14px',
          background: feedback.isSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: `1px solid ${feedback.isSuccess ? '#10b981' : '#ef4444'}`,
          color: feedback.isSuccess ? '#10b981' : '#ef4444',
          fontWeight: 700,
          fontSize: '0.88rem',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          {feedback.text}
        </div>
      )}

      {/* Atom Dispenser Tray */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
        {AVAILABLE_ATOMS.map((atom) => (
          <button
            key={atom.symbol}
            onClick={() => handleAddAtom(atom)}
            disabled={isPaused}
            style={{
              padding: '10px 16px',
              borderRadius: '14px',
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
              border: `1.5px solid ${atom.color}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              color: isLight ? '#0f172a' : '#ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: atom.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.85rem'
            }}>
              {atom.symbol}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '0.86rem' }}>{atom.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Valence: {atom.valence}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={handleClearReactor}
          disabled={reactorAtoms.length === 0}
          style={{
            padding: '12px 20px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: reactorAtoms.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Clear Chamber
        </button>

        <button
          onClick={handleSynthesize}
          disabled={reactorAtoms.length === 0}
          style={{
            padding: '12px 28px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#ffffff',
            fontSize: '0.92rem',
            fontWeight: 800,
            border: 'none',
            cursor: reactorAtoms.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
          }}
        >
          <FlaskConical size={16} /> Synthesize Molecule!
        </button>
      </div>
    </div>
  );
};

export default ChemicalReactor;
