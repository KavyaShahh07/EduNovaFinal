import React, { useState, useEffect, useRef } from 'react';
import { Zap, Clock, Target, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

const TARGET_COLORS = [
  { name: 'CYAN', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)' },
  { name: 'AMBER', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' },
  { name: 'EMERALD', color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' },
  { name: 'PURPLE', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' }
];

const HAZARD_COLOR = { name: 'CRIMSON', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.8)' };

export const NeuralReactionArena = ({
  isPaused,
  isMuted,
  isLight,
  onFinish,
  onAttempt,
  onChallengeChange
}) => {
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [activeInstruction, setActiveInstruction] = useState(TARGET_COLORS[0]);
  const [orbs, setOrbs] = useState([]);
  const [wave, setWave] = useState(1);
  const [curriculumPopup, setCurriculumPopup] = useState(null);

  const spawnTimerRef = useRef(null);
  const lastSpawnTimeRef = useRef(Date.now());

  // Educational booster questions between waves
  const curriculumQuestions = [
    {
      question: '⚡ Rapid Recall: Kinetic Energy is proportional to velocity squared (v²)?',
      options: ['True (KE = ½mv²)', 'False (KE = mv)'],
      answer: 'True (KE = ½mv²)'
    },
    {
      question: '⚡ Rapid Recall: In Ohm’s Law, if Voltage doubles and Resistance is constant, Current:',
      options: ['Doubles', 'Halves', 'Remains Same'],
      answer: 'Doubles'
    },
    {
      question: '⚡ Rapid Recall: Which data structure operates on First-In First-Out (FIFO)?',
      options: ['Queue', 'Stack', 'Tree'],
      answer: 'Queue'
    }
  ];

  // Spawn new cognitive orbs
  const spawnOrbs = () => {
    const orbCount = Math.min(6, 3 + Math.floor(wave / 2));
    const newOrbs = [];
    const validTarget = TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)];
    setActiveInstruction(validTarget);
    lastSpawnTimeRef.current = Date.now();

    for (let i = 0; i < orbCount; i++) {
      const isHazard = Math.random() < 0.28;
      const isTarget = !isHazard && Math.random() < 0.45;
      const colorObj = isHazard ? HAZARD_COLOR : isTarget ? validTarget : TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)];

      newOrbs.push({
        id: `orb-${Date.now()}-${i}`,
        x: 10 + Math.random() * 80,
        y: 15 + Math.random() * 65,
        size: 55 + Math.random() * 20,
        colorObj,
        isTarget: colorObj.name === validTarget.name,
        isHazard
      });
    }
    setOrbs(newOrbs);
  };

  // Main game tick
  useEffect(() => {
    if (isPaused || curriculumPopup) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, curriculumPopup]);

  // Initial spawn & wave spawner
  useEffect(() => {
    if (isPaused || curriculumPopup) return;
    spawnOrbs();

    const spawnInterval = Math.max(1600, 2800 - wave * 200);
    spawnTimerRef.current = setInterval(spawnOrbs, spawnInterval);

    return () => clearInterval(spawnTimerRef.current);
  }, [wave, isPaused, curriculumPopup]);

  // Handle clicking an orb
  const handleOrbClick = (orb) => {
    if (isPaused || curriculumPopup) return;
    const now = Date.now();
    const rt = now - lastSpawnTimeRef.current;
    setReactionTimes(prev => [...prev, rt]);

    if (orb.isHazard) {
      soundManager.playWrong();
      setCombo(0);
      setMisses(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 40));
      onAttempt({
        question: `Hazard Triggered: Clicked ${orb.colorObj.name}`,
        userAnswer: 'Hazard Clicked',
        correctAnswer: `Avoid ${HAZARD_COLOR.name}`
      });
    } else if (orb.isTarget) {
      soundManager.playCorrect();
      const added = 100 + (combo * 25);
      setScore(prev => prev + added);
      setCombo(prev => {
        const next = prev + 1;
        if (next % 4 === 0) soundManager.playCombo(next);
        return next;
      });
      setHits(prev => prev + 1);
      onAttempt(null);
    } else {
      soundManager.playWrong();
      setCombo(0);
      setMisses(prev => prev + 1);
      onAttempt({
        question: `Instruction: Hit ${activeInstruction.name}`,
        userAnswer: orb.colorObj.name,
        correctAnswer: activeInstruction.name
      });
    }

    // Remove clicked orb
    setOrbs(prev => prev.filter(o => o.id !== orb.id));

    // Check wave progression
    if (hits > 0 && hits % 5 === 0 && !curriculumPopup) {
      const q = curriculumQuestions[(wave - 1) % curriculumQuestions.length];
      setCurriculumPopup(q);
      onChallengeChange(q);
    }
  };

  const handleCurriculumAnswer = (opt) => {
    const isCorrect = opt === curriculumPopup.answer;
    if (isCorrect) {
      soundManager.playCorrect();
      setScore(prev => prev + 150);
      setCombo(prev => prev + 2);
    } else {
      soundManager.playWrong();
      setScore(prev => Math.max(0, prev - 30));
    }
    setWave(prev => prev + 1);
    setCurriculumPopup(null);
    spawnOrbs();
  };

  const finishGame = () => {
    const total = hits + misses;
    const accuracy = total > 0 ? Math.round((hits / total) * 100) : 100;
    const avgRt = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 350;

    onFinish({
      score,
      accuracy,
      durationSeconds: 45 - timeLeft,
      combo,
      level: wave,
      stats: { avgReactionTimeMs: avgRt }
    });
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '850px',
      height: '540px',
      position: 'relative',
      borderRadius: '24px',
      background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 15, 36, 0.92)',
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(56, 189, 248, 0.3)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      userSelect: 'none'
    }}>
      {/* Top HUD */}
      <div style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.25)'
      }}>
        {/* Active Target Directive */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '0.82rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: activeInstruction.color,
            background: `${activeInstruction.color}22`,
            border: `1px solid ${activeInstruction.color}66`,
            padding: '6px 14px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: activeInstruction.color, boxShadow: `0 0 10px ${activeInstruction.color}` }} />
            TARGET: {activeInstruction.name} • AVOID CRIMSON
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Wave {wave}</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '0.9rem', fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
            <Zap size={16} /> {score}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>
            <Flame size={16} /> {combo}x
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: timeLeft <= 10 ? '#ef4444' : '#10b981' }}>
            <Clock size={16} /> {timeLeft}s
          </div>
        </div>
      </div>

      {/* Arena Interactive Surface */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {orbs.map(orb => (
          <button
            key={orb.id}
            onClick={() => handleOrbClick(orb)}
            style={{
              position: 'absolute',
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${orb.colorObj.color} 70%)`,
              border: `2px solid ${orb.colorObj.color}`,
              boxShadow: `0 0 20px ${orb.colorObj.glow}, inset 0 0 12px rgba(255,255,255,0.6)`,
              cursor: 'pointer',
              transform: 'translate(-50%, -50%) scale(1)',
              transition: 'transform 0.1s ease',
              animation: 'pulse 1.8s infinite ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none'
            }}
          >
            {orb.isHazard ? (
              <AlertTriangle size={20} color="#ffffff" />
            ) : orb.isTarget ? (
              <Target size={20} color="#ffffff" />
            ) : (
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ffffff', opacity: 0.8 }}>TAP</span>
            )}
          </button>
        ))}

        {/* Curriculum Booster Modal */}
        {curriculumPopup && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 10, 26, 0.92)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            zIndex: 30
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(56, 189, 248, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <ShieldCheck size={26} color="#38bdf8" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', maxWidth: '520px' }}>
              {curriculumPopup.question}
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {curriculumPopup.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCurriculumAnswer(opt)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(37, 99, 235, 0.3) 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(56, 189, 248, 0.25)'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuralReactionArena;
