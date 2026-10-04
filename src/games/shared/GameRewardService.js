/**
 * EduNova Game Arena — GameRewardService
 * Centralized reward, streak, personal best, and achievement validation.
 * Interacts with backend API and local store without spoofing scores.
 */

import { gameService } from '../../services/gameService';

const ACHIEVEMENTS_KEY = 'edunova_game_achievements_v1';
const STREAK_KEY = 'edunova_game_streak_v1';

export const GAME_ACHIEVEMENTS = [
  {
    id: 'speed_demon',
    title: '⚡ Speed Demon',
    description: 'Complete a reaction or sprint challenge with >90% accuracy in under 45 seconds.',
    icon: '⚡',
    condition: (res) => (res.gameId?.includes('reaction') || res.gameId?.includes('rapid')) && res.accuracy >= 90 && (res.durationSeconds || 60) <= 45
  },
  {
    id: 'memory_master',
    title: '🧠 Memory Master',
    description: 'Reach a memory sequence streak or accuracy above 95% in Memory Matrix or Memory Vault.',
    icon: '🧠',
    condition: (res) => (res.gameId?.includes('memory')) && (res.accuracy >= 95 || res.score >= 500)
  },
  {
    id: 'combo_king',
    title: '🔥 Combo King',
    description: 'Achieve a 10x combo multiplier in any learning game.',
    icon: '🔥',
    condition: (res) => (res.combo || 0) >= 10 || (res.score || 0) >= 800
  },
  {
    id: 'bug_hunter',
    title: '🐛 Bug Hunter',
    description: 'Successfully debug and fix flawless code in Code Breaker or Fix Mistake.',
    icon: '🐛',
    condition: (res) => (res.gameId?.includes('code') || res.gameId?.includes('fix') || res.gameId?.includes('mistake')) && res.accuracy >= 80
  },
  {
    id: 'boss_slayer',
    title: '🚀 Boss Slayer',
    description: 'Defeat a Subject Boss or reach Phase 3 in Boss Battle 2.0.',
    icon: '🚀',
    condition: (res) => res.gameId?.includes('boss') && (res.score >= 400 || res.completed)
  },
  {
    id: 'quantum_mind',
    title: '🌌 Quantum Mind',
    description: 'Solve quantum sequences and logic rooms with zero mistakes.',
    icon: '🌌',
    condition: (res) => (res.gameId?.includes('quantum') || res.gameId?.includes('logic')) && res.accuracy === 100
  }
];

class GameRewardService {
  /**
   * Submit and record a completed game session.
   * Dispatches authentic XP to global EduNova navbar & profile.
   */
  async recordGameCompletion({
    gameId,
    gameTitle,
    subject = 'General',
    score = 0,
    accuracy = 0,
    durationSeconds = 30,
    combo = 0,
    mistakes = [],
    level = 1,
    completed = true
  }) {
    const cleanScore = Math.max(0, Math.floor(score));
    const cleanAccuracy = Math.min(100, Math.max(0, Math.round(accuracy)));
    const cleanDuration = Math.max(1, Math.floor(durationSeconds));

    // Base XP bounded authentically: 20 base + score/15 * accuracy
    const calculatedXp = Math.min(150, Math.max(20, Math.floor((cleanScore / 12) * (cleanAccuracy / 100)) + 25));

    const payload = {
      gameId,
      gameTitle,
      subject,
      score: cleanScore,
      accuracy: cleanAccuracy,
      durationSeconds: cleanDuration,
      combo,
      level,
      completed,
      mistakes,
      xpEarned: calculatedXp
    };

    // 1. Save to backend / local storage
    const savedResult = await gameService.saveGameResult(payload);

    // 2. Dispatch global event to sync navbar XP and profile immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('edunova_xp_updated', {
          detail: {
            xpEarned: calculatedXp,
            gameTitle,
            score: cleanScore
          }
        })
      );
    }

    // 3. Update game streak
    this.updateStreak();

    // 4. Check for newly unlocked achievements
    const newAchievements = this.checkAchievements({
      ...payload,
      id: savedResult.id
    });

    return {
      result: savedResult,
      xpEarned: calculatedXp,
      newAchievements
    };
  }

  /**
   * Update consecutive daily game streak authentically
   */
  updateStreak() {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const raw = localStorage.getItem(STREAK_KEY);
      let data = raw ? JSON.parse(raw) : { currentStreak: 1, lastPlayedDate: null };

      if (!data.lastPlayedDate) {
        data = { currentStreak: 1, lastPlayedDate: todayStr };
      } else if (data.lastPlayedDate !== todayStr) {
        const lastDate = new Date(data.lastPlayedDate);
        const today = new Date(todayStr);
        const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          data.currentStreak += 1;
        } else if (diffDays > 1) {
          data.currentStreak = 1; // streak reset
        }
        data.lastPlayedDate = todayStr;
      }
      localStorage.setItem(STREAK_KEY, JSON.stringify(data));
      return data.currentStreak;
    } catch (e) {
      return 1;
    }
  }

  getStreak() {
    try {
      const raw = localStorage.getItem(STREAK_KEY);
      return raw ? JSON.parse(raw).currentStreak || 1 : 1;
    } catch (e) {
      return 1;
    }
  }

  /**
   * Unlock any newly earned achievements
   */
  checkAchievements(gameSession) {
    try {
      const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
      const unlockedIds = new Set(stored ? JSON.parse(stored) : []);
      const newlyUnlocked = [];

      for (const ach of GAME_ACHIEVEMENTS) {
        if (!unlockedIds.has(ach.id) && ach.condition(gameSession)) {
          unlockedIds.add(ach.id);
          newlyUnlocked.push(ach);
        }
      }

      if (newlyUnlocked.length > 0) {
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(Array.from(unlockedIds)));
      }

      return newlyUnlocked;
    } catch (e) {
      return [];
    }
  }

  getUnlockedAchievements() {
    try {
      const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
      const unlockedIds = new Set(stored ? JSON.parse(stored) : []);
      return GAME_ACHIEVEMENTS.map(ach => ({
        ...ach,
        unlocked: unlockedIds.has(ach.id)
      }));
    } catch (e) {
      return GAME_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false }));
    }
  }
}

export const gameRewardService = new GameRewardService();
export default gameRewardService;
