import React from 'react';
import { useLearning } from '../../context/LearningContext';
import { Flame, Shield, Award, RotateCcw } from 'lucide-react';
import { EduNovaHeroBanner } from '../common/EduNovaHeroBanner';

export const AchievementHero = () => {
  const { levelInfo = { level: 1, rankTitle: 'Explorer', remainingXp: 400, progressPercent: 0 }, xp = 0, streakDays = 0, streakShields = 0, resetGamification } = useLearning() || {};

  const handleReset = async () => {
    if (window.confirm('Reset your XP and Level back to Level 1 (0 XP) for a fresh start?')) {
      if (resetGamification) await resetGamification();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ position: 'relative' }}>
        <EduNovaHeroBanner
          badge={`✦ LEVEL ${levelInfo.level} • ${levelInfo.rankTitle}`}
          title={`${xp.toLocaleString()} XP Earned 🏆`}
          subtitle={`${levelInfo.remainingXp.toLocaleString()} XP remaining to unlock Level ${levelInfo.level + 1}. Keep pushing your boundaries!`}
          stats={[
            { label: `Level ${levelInfo.level}`, subtext: `${xp} XP total`, icon: Award, color: '#f59e0b', progress: levelInfo.progressPercent },
            { label: `${streakDays} Days`, subtext: 'Daily Streak', icon: Flame, color: '#f97316' },
            { label: `${streakShields || 0} Shields`, subtext: 'Streak Protection', icon: Shield, color: '#38bdf8' }
          ]}
        />
        <button
          onClick={handleReset}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#ef4444',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 10
          }}
          title="Reset back to Level 1 (0 XP)"
        >
          <RotateCcw size={13} /> Reset to Level 1 (0 XP)
        </button>
      </div>
    </div>
  );
};
