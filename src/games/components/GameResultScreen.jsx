import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Zap, Clock, Target, Flame, RotateCcw, ArrowLeft, Award, PlusCircle, CheckCircle } from 'lucide-react';
import { soundManager } from '../shared/SoundManager';

export const GameResultScreen = ({
  result,
  onPlayAgain,
  onExit,
  onCreateTask,
  isLight = false
}) => {
  useEffect(() => {
    soundManager.playVictory();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, []);

  if (!result) return null;

  const {
    gameTitle = 'Game Challenge',
    score = 0,
    accuracy = 100,
    xpEarned = 50,
    durationSeconds = 45,
    combo = 0,
    newRecord = false,
    newAchievements = []
  } = result;

  return (
    <div style={{
      width: '100%',
      maxWidth: '560px',
      margin: '0 auto',
      background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.16)',
      borderRadius: '28px',
      padding: '32px 28px',
      textAlign: 'center',
      boxShadow: isLight ? '0 20px 45px rgba(0,0,0,0.08)' : '0 25px 60px rgba(0,0,0,0.6)',
      color: isLight ? '#0f172a' : '#ffffff',
      animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Trophy Badge */}
      <div style={{
        width: '68px',
        height: '68px',
        borderRadius: '22px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.1) 100%)',
        border: '1.5px solid rgba(245, 158, 11, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        <Trophy size={34} color="#f59e0b" />
      </div>

      <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 6px 0' }}>
        Challenge Complete!
      </h2>
      <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.88rem', margin: '0 0 24px 0' }}>
        {gameTitle}
      </p>

      {/* Primary XP Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(56, 189, 248, 0.12) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '18px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}>
        <Award size={26} color="#c084fc" />
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#c084fc' }}>
            +{xpEarned} Learning XP
          </div>
          <div style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#cbd5e1' }}>
            Directly credited to your EduNova Profile & Rank
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)',
          borderRadius: '16px',
          padding: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.8rem', marginBottom: '4px' }}>
            <Zap size={14} /> Total Score
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: isLight ? '#0f172a' : '#ffffff' }}>
            {score}
          </div>
        </div>

        <div style={{
          background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)',
          borderRadius: '16px',
          padding: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#10b981', fontSize: '0.8rem', marginBottom: '4px' }}>
            <Target size={14} /> Accuracy
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>
            {accuracy}%
          </div>
        </div>

        <div style={{
          background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)',
          borderRadius: '16px',
          padding: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.8rem', marginBottom: '4px' }}>
            <Clock size={14} /> Duration
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff' }}>
            {durationSeconds}s
          </div>
        </div>

        <div style={{
          background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)',
          borderRadius: '16px',
          padding: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#f43f5e', fontSize: '0.8rem', marginBottom: '4px' }}>
            <Flame size={14} /> Max Combo
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f43f5e' }}>
            {combo}x
          </div>
        </div>
      </div>

      {/* New Achievements unlocked */}
      {newAchievements && newAchievements.length > 0 && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '16px',
          padding: '12px 16px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '0.85rem', marginBottom: '6px' }}>
            <Trophy size={16} /> New Achievement Unlocked!
          </div>
          {newAchievements.map(ach => (
            <div key={ach.id} style={{ fontSize: '0.82rem', color: isLight ? '#0f172a' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{ach.icon}</span> <strong>{ach.title}:</strong> {ach.description}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={onPlayAgain}
          style={{
            width: '100%',
            padding: '13px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.92rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)'
          }}
        >
          <RotateCcw size={16} /> Play Again
        </button>

        {onCreateTask && (
          <button
            onClick={() => onCreateTask(result)}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <PlusCircle size={16} /> Add Revision Task
          </button>
        )}

        <button
          onClick={onExit}
          style={{
            width: '100%',
            padding: '11px 20px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: isLight ? '#475569' : '#cbd5e1',
            fontWeight: 600,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft size={16} /> Back to Game Arena
        </button>
      </div>
    </div>
  );
};

export default GameResultScreen;
