import React from 'react';
import { Play, RotateCcw, Clock, Trophy, ArrowRight, Gamepad2, Sparkles } from 'lucide-react';

export const ContinuePlayingWidget = ({
  recentGame = null,
  onContinue,
  isLight = false
}) => {
  if (!recentGame) {
    return (
      <div style={{
        background: isLight
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 246, 255, 0.75) 100%)'
          : 'linear-gradient(135deg, rgba(20, 30, 65, 0.6) 0%, rgba(12, 18, 42, 0.7) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: isLight ? '1px solid rgba(255, 255, 255, 0.95)' : '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '13px 20px',
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: isLight
          ? '0 6px 18px rgba(64, 100, 160, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.8)'
          : '0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isLight ? '#475569' : '#cbd5e1', fontSize: '0.86rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '9px',
            background: 'rgba(56, 189, 248, 0.14)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Gamepad2 size={16} color="#38bdf8" />
          </div>
          <span style={{ fontWeight: 500 }}>
            Your arena is ready. Choose any game below to start building your Game XP!
          </span>
        </div>

        <div style={{
          fontSize: '0.74rem',
          fontWeight: 700,
          color: '#38bdf8',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          padding: '3px 10px',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <Sparkles size={12} color="#38bdf8" />
          <span>26 Games Available</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: isLight
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 246, 255, 0.82) 100%)'
          : 'linear-gradient(135deg, rgba(20, 32, 70, 0.72) 0%, rgba(14, 20, 48, 0.8) 100%)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: isLight ? '1px solid rgba(255, 255, 255, 0.95)' : '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '18px',
        padding: '16px 22px',
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: isLight
          ? '0 10px 24px rgba(64, 100, 160, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.8)'
          : '0 12px 30px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.18)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'rgba(56, 189, 248, 0.14)',
          border: '1px solid rgba(56, 189, 248, 0.32)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 14px rgba(56, 189, 248, 0.15)'
        }}>
          <RotateCcw size={18} color="#38bdf8" />
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            CONTINUE PLAYING
          </div>
          <div style={{ fontSize: '1.02rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff', marginTop: '1px' }}>
            {recentGame.gameTitle} {recentGame.level ? `• Level ${recentGame.level}` : ''}
          </div>
          <div style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '1px' }}>
            Last Score: <strong style={{ color: '#38bdf8' }}>{recentGame.score} pts</strong> • Accuracy: {recentGame.accuracy}%
          </div>
        </div>
      </div>

      <button
        onClick={() => onContinue(recentGame)}
        style={{
          padding: '9px 18px',
          borderRadius: '11px',
          background: isLight
            ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
            : 'rgba(56, 189, 248, 0.14)',
          border: isLight ? 'none' : '1px solid rgba(56, 189, 248, 0.32)',
          color: isLight ? '#ffffff' : '#38bdf8',
          fontWeight: 600,
          fontSize: '0.84rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          boxShadow: isLight ? '0 4px 14px rgba(37, 99, 235, 0.28)' : '0 4px 14px rgba(56, 189, 248, 0.12)',
          transition: 'all 0.2s ease'
        }}
      >
        <Play size={13} fill={isLight ? '#ffffff' : '#38bdf8'} />
        <span>Continue Session</span>
      </button>
    </div>
  );
};

export default ContinuePlayingWidget;
