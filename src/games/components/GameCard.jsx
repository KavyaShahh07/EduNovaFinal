import React from 'react';
import { Play, Star, Clock, Trophy, Award } from 'lucide-react';

export const GameCard = ({
  game,
  personalBest = null,
  onLaunch,
  isLight = false
}) => {
  const Icon = game.icon;
  const bestScore = personalBest?.score;

  // Star difficulty rating
  const getStarRating = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 2;
      case 'medium': return 3;
      case 'hard': return 4;
      case 'expert': return 5;
      default: return 3;
    }
  };

  const stars = getStarRating(game.difficulty);

  return (
    <div
      style={{
        background: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.06)' : '0 20px 45px rgba(0,0,0,0.4)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div>
        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: `${game.accentColor || '#38bdf8'}22`,
            border: `1px solid ${game.accentColor || '#38bdf8'}55`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {Icon ? <Icon size={24} color={game.accentColor || '#38bdf8'} /> : '🎮'}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 900,
              color: game.accentColor || '#38bdf8',
              background: `${game.accentColor || '#38bdf8'}15`,
              padding: '4px 10px',
              borderRadius: '9999px',
              border: `1px solid ${game.accentColor || '#38bdf8'}33`
            }}>
              {game.badge || game.category}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: isLight ? '#0f172a' : '#ffffff', margin: '0 0 8px 0' }}>
          {game.title}
        </h4>

        <p style={{ color: isLight ? '#475569' : '#cbd5e1', fontSize: '0.88rem', margin: '0 0 16px 0', lineHeight: 1.45 }}>
          {game.description}
        </p>

        {/* Meta Bar: Difficulty, Est Time, Personal Best */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px 14px',
          borderRadius: '14px',
          background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: '20px',
          fontSize: '0.8rem'
        }}>
          {/* Difficulty & Time */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>Difficulty:</span>
              <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    fill={i < stars ? '#f59e0b' : 'none'}
                    color={i < stars ? '#f59e0b' : '#64748b'}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isLight ? '#64748b' : '#94a3b8' }}>
              <Clock size={13} /> {game.estimatedDuration || '2 mins'}
            </div>
          </div>

          {/* Personal Best & XP */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trophy size={13} color="#38bdf8" />
              <span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>Best:</span>
              <strong style={{ color: bestScore ? '#38bdf8' : isLight ? '#64748b' : '#94a3b8' }}>
                {bestScore ? `${bestScore} pts` : 'Not played yet'}
              </strong>
            </div>

            <span style={{ fontWeight: 800, color: '#c084fc' }}>
              +{game.xpReward || 100} XP
            </span>
          </div>
        </div>
      </div>

      {/* Launch Action Button */}
      <button
        onClick={() => onLaunch(game)}
        style={{
          width: '100%',
          padding: '11px 18px',
          borderRadius: '12px',
          background: isLight
            ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
            : 'rgba(56, 189, 248, 0.12)',
          border: isLight ? 'none' : '1px solid rgba(56, 189, 248, 0.32)',
          color: isLight ? '#ffffff' : '#38bdf8',
          fontWeight: 600,
          fontSize: '0.86rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          backdropFilter: 'blur(16px)',
          boxShadow: isLight
            ? '0 6px 18px rgba(56, 189, 248, 0.25)'
            : '0 4px 14px rgba(56, 189, 248, 0.12)',
          transition: 'all 0.2s ease'
        }}
      >
        <Play size={14} fill={isLight ? '#ffffff' : '#38bdf8'} /> Launch Game
      </button>
    </div>
  );
};

export default GameCard;
