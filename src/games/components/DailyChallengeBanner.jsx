import React from 'react';
import { Flame, Sparkles, Trophy, Award } from 'lucide-react';

export const DailyChallengeBanner = ({
  streak = 1,
  onPlayDaily,
  isLight = false
}) => {
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '24px',
        background: isLight
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(245, 248, 255, 0.88) 100%)'
          : 'linear-gradient(135deg, rgba(20, 32, 70, 0.75) 0%, rgba(14, 20, 48, 0.85) 100%)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: isLight ? '1px solid rgba(255, 255, 255, 0.95)' : '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: isLight
          ? '0 16px 40px rgba(64, 100, 160, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)'
          : '0 20px 48px rgba(0, 0, 0, 0.45), inset 0 1px 1.5px rgba(255, 255, 255, 0.22)',
        padding: '22px 28px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        overflow: 'hidden',
        transition: 'all 0.25s ease'
      }}
    >
      {/* Subtle ambient warm glow inside the card */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        left: '20px',
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Left: Icon & Challenge Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '15px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.12) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.38)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
          flexShrink: 0
        }}>
          <Flame size={24} color="#f59e0b" fill="rgba(245, 158, 11, 0.25)" />
        </div>

        <div>
          {/* Header pill tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#f59e0b',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '2px 10px',
              borderRadius: '9999px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              TODAY'S ARENA CHALLENGE • {todayDateStr}
            </span>

            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#c084fc',
              background: 'rgba(192, 132, 252, 0.12)',
              border: '1px solid rgba(192, 132, 252, 0.25)',
              padding: '2px 10px',
              borderRadius: '9999px'
            }}>
              +150 Bonus XP
            </span>
          </div>

          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            margin: '0 0 3px 0',
            color: isLight ? '#0f172a' : '#ffffff',
            letterSpacing: '-0.01em'
          }}>
            ⚡ Precision Reflex & Kinetic Sprint
          </h3>
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            color: isLight ? '#5D7192' : '#cbd5e1',
            lineHeight: 1.45
          }}>
            Achieve 90%+ accuracy in rapid cognitive problem retrieval to reinforce your active streak.
          </p>
        </div>
      </div>

      {/* Right: Streak & Call To Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
        {/* Streak Counter */}
        <div style={{
          textAlign: 'right',
          paddingRight: '20px',
          borderRight: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <div style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '6px'
          }}>
            <Flame size={17} fill="#f59e0b" color="#f59e0b" />
            <span>{streak > 0 ? `${streak} Day Streak` : 'Start Streak'}</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
            {streak > 0 ? 'Consistent practice unlocked' : 'Play first game today'}
          </div>
        </div>

        {/* Action Button matching EduNova hero banner style exactly */}
        <button
          onClick={onPlayDaily}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: isLight
              ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.88rem',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(217, 119, 6, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap'
          }}
        >
          <Flame size={16} color="#ffffff" fill="rgba(255, 255, 255, 0.25)" />
          <span>Play Daily Challenge</span>
        </button>
      </div>
    </div>
  );
};

export default DailyChallengeBanner;
