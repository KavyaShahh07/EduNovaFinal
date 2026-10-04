import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { calculateLevelInfo } from '../utils/levelCalculator';
import { checkAchievementRules } from '../utils/achievementEngine';
import { sampleAchievements } from '../data/achievements';
import { gamificationApi } from '../lib/apiClient';
import { useAuth } from './AuthContext';

const DEFAULT_XP_TRANSACTIONS = [
  { id: 'tx_def_1', title: 'Completed Diagnostic Biology Quiz Assessment', xp: 120, category: 'Quiz', timeAgo: '2 hours ago' },
  { id: 'tx_def_2', title: '7-Day Learning Consistency & Streak Bonus', xp: 100, category: 'Streak', timeAgo: '1 day ago' },
  { id: 'tx_def_3', title: 'Mastered Modern React & UI Architecture Skill', xp: 150, category: 'Skills', timeAgo: '2 days ago' },
  { id: 'tx_def_4', title: 'Completed Data Structures & Algorithms Quiz', xp: 80, category: 'Quiz', timeAgo: '3 days ago' },
  { id: 'tx_def_5', title: 'Read Chapter 4: Operating Systems Note', xp: 50, category: 'Learning', timeAgo: '4 days ago' },
  { id: 'tx_def_6', title: 'Peer Skill Exchange Mentorship Session Completed', xp: 110, category: 'Skills', timeAgo: '5 days ago' }
];

const LearningContext = createContext();

export const LearningProvider = ({ children }) => {
  const { user } = useAuth() || {};

  const [xp, setXp] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [weeklyConsistency, setWeeklyConsistency] = useState([false, false, false, false, false, false, false]);
  const [streakShields, setStreakShields] = useState(0);

  const [achievements, setAchievements] = useState(sampleAchievements);
  const [dailyMissions, setDailyMissions] = useState([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState(null);

  const [levelInfo, setLevelInfo] = useState(() => calculateLevelInfo(0));
  const [levelUpData, setLevelUpData] = useState(null);

  const [xpTransactions, setXpTransactions] = useState(DEFAULT_XP_TRANSACTIONS);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);

  const userId = user?.id;

  /**
   * Evaluates dynamic achievement unlock progress based on live user statistics
   */
  const updateAchievementProgress = useCallback((currentXp, currentStreak, customStats = {}) => {
    setAchievements((prevAchievements) => {
      const baseList = prevAchievements.length > 0 ? prevAchievements : sampleAchievements;
      const stats = {
        totalXp: currentXp,
        streakDays: currentStreak,
        lessonsCompleted: customStats.lessonsCompleted || 0,
        quizzesCompleted: customStats.quizzesCompleted || 0,
        perfectQuizzes: customStats.perfectQuizzes || 0,
        skillsMastered: customStats.skillsMastered || 0,
        xrActivities: customStats.xrActivities || 0,
        peerSessions: customStats.peerSessions || 0,
        ...customStats
      };

      const updated = checkAchievementRules(stats, baseList);
      return updated;
    });
  }, []);

  /**
   * Sync live gamification state from backend on mount or user change
   */
  const syncGamificationState = useCallback(async () => {
    if (!user) {
      setXp(0);
      setStreakDays(0);
      setBestStreak(0);
      setDailyMissions([]);
      setXpTransactions(DEFAULT_XP_TRANSACTIONS);
      setLevelInfo(calculateLevelInfo(0));
      setAchievements(sampleAchievements.map(a => ({ ...a, unlocked: false, progress: 0 })));
      return;
    }

    let currentXp = user.learnerProfile?.xp ?? 0;
    let currentStreak = user.learnerProfile?.streakDays ?? 0;

    setXp(currentXp);
    setStreakDays(currentStreak);
    setBestStreak(currentStreak);

    try {
      // 2. Fetch live summary and missions in parallel
      const [summaryRes, missionsRes] = await Promise.allSettled([
        gamificationApi.getSummary(),
        gamificationApi.getMissions(),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value?.success && summaryRes.value.data) {
        const s = summaryRes.value.data;
        currentXp = s.xp ?? currentXp;
        currentStreak = s.streakDays ?? currentStreak;

        setXp(currentXp);
        setStreakDays(currentStreak);
        setBestStreak((prev) => Math.max(prev, currentStreak));

        if (Array.isArray(s.xpHistory) && s.xpHistory.length > 0) {
          const mapped = s.xpHistory.map((t) => {
            const title = (t.sourceTitle || '').toLowerCase();
            let category = 'Learning';
            if (title.includes('quiz') || title.includes('assessment') || title.includes('test') || title.includes('question') || title.includes('exam')) {
              category = 'Quiz';
            } else if (title.includes('streak') || title.includes('daily') || title.includes('login') || title.includes('consistency')) {
              category = 'Streak';
            } else if (title.includes('skill') || title.includes('project') || title.includes('lab') || title.includes('exchange') || title.includes('dsa') || title.includes('code')) {
              category = 'Skills';
            }
            return {
              id: t.id,
              title: t.sourceTitle,
              xp: t.amount,
              category,
              createdAt: t.createdAt,
              timeAgo: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recently',
            };
          });
          setXpTransactions(mapped);
        } else {
          setXpTransactions(DEFAULT_XP_TRANSACTIONS);
        }
      }

      if (missionsRes.status === 'fulfilled' && missionsRes.value?.success) {
        const missions = missionsRes.value.data || [];
        setDailyMissions(missions.filter((m) => m.period === 'DAILY'));
        const weekly = missions.find((m) => m.period === 'WEEKLY');
        if (weekly) setWeeklyChallenge(weekly);
      }
    } catch (err) {
      console.warn('[LearningContext] Gamification sync error:', err.message);
    } finally {
      setLoading(false);
      updateAchievementProgress(currentXp, currentStreak);
    }
  }, [userId, user, updateAchievementProgress]);

  useEffect(() => {
    syncGamificationState();

    const handleTaskUpdate = () => {
      syncGamificationState();
    };

    window.addEventListener('edunova_task_updated', handleTaskUpdate);

    return () => {
      window.removeEventListener('edunova_task_updated', handleTaskUpdate);
    };
  }, [syncGamificationState]);

  // Recalculate level info whenever XP updates
  useEffect(() => {
    const newLevelInfo = calculateLevelInfo(xp);
    setLevelInfo(newLevelInfo);
    updateAchievementProgress(xp, streakDays);
  }, [xp, streakDays, updateAchievementProgress]);

  /**
   * Real XP Awarding:
   * Calls POST /api/gamification/xp and updates client state
   */
  const earnXp = useCallback(async (amount, sourceTitle = 'Learning Activity', category = null) => {
    const safeAmount = Number(amount) || 0;
    if (safeAmount <= 0) return;

    let cat = category;
    if (!cat) {
      const lower = sourceTitle.toLowerCase();
      if (lower.includes('quiz') || lower.includes('assessment') || lower.includes('test') || lower.includes('question')) {
        cat = 'Quiz';
      } else if (lower.includes('streak') || lower.includes('daily') || lower.includes('login')) {
        cat = 'Streak';
      } else if (lower.includes('skill') || lower.includes('project') || lower.includes('lab') || lower.includes('exchange')) {
        cat = 'Skills';
      } else {
        cat = 'Learning';
      }
    }

    // Optimistic UI update
    setXp((prevXp) => {
      const newXp = prevXp + safeAmount;
      updateAchievementProgress(newXp, streakDays);
      return newXp;
    });

    const tempTx = {
      id: `tx_${Date.now()}`,
      title: sourceTitle,
      xp: safeAmount,
      category: cat,
      timeAgo: 'Just now',
    };
    setXpTransactions((prev) => [tempTx, ...prev]);

    // Persist to PostgreSQL backend
    try {
      const res = await gamificationApi.addXp(safeAmount, sourceTitle);
      const data = res?.data;

      if (data?.transaction?.id) {
        setXpTransactions((prev) =>
          prev.map((tx) => (tx.id === tempTx.id ? { ...tx, id: data.transaction.id } : tx))
        );
      }

      if (typeof data?.newXp === 'number') {
        setXp(data.newXp);
        updateAchievementProgress(data.newXp, streakDays);
      }

      if (data?.leveledUp) {
        const newLvlInfo = calculateLevelInfo(data.newXp);
        setLevelUpData({
          oldLevel: (data.newLevel || newLvlInfo.level) - 1,
          newLevel: data.newLevel || newLvlInfo.level,
          rankTitle: newLvlInfo.rankTitle || newLvlInfo.title || 'Scholar',
          perk: 'Unlocked daily challenge boost and advanced topic access!'
        });
      }
    } catch (err) {
      console.warn('[LearningContext] Failed to persist XP to backend:', err.message);
    }
  }, [streakDays, updateAchievementProgress]);

  /**
   * Real Mission Completion:
   * Calls POST /api/gamification/missions/:id/complete and synchronizes live rewards
   */
  const completeMission = useCallback(async (missionId) => {
    try {
      const res = await gamificationApi.completeMission(missionId);
      if (res?.success && res.data) {
        const { rewardXp, newXp, newLevel, streakDays: updatedStreak, leveledUp } = res.data;

        if (typeof newXp === 'number') {
          setXp(newXp);
          updateAchievementProgress(newXp, updatedStreak || streakDays);
        }
        if (typeof updatedStreak === 'number') setStreakDays(updatedStreak);

        // Update local mission completed state
        setDailyMissions((prev) =>
          prev.map((m) =>
            m.id === missionId ? { ...m, completed: true, userProgress: 100 } : m
          )
        );

        if (leveledUp) {
          const newLvlInfo = calculateLevelInfo(newXp);
          setLevelUpData({
            oldLevel: (newLevel || newLvlInfo.level) - 1,
            newLevel: newLevel || newLvlInfo.level,
            rankTitle: newLvlInfo.rankTitle || newLvlInfo.title || 'Scholar',
            perk: 'Unlocked daily challenge boost and advanced topic access!'
          });
        }

        // Add to transaction feed
        setXpTransactions((prev) => [
          {
            id: `tx_${Date.now()}`,
            title: `Mission Completed: ${res.data.missionTitle}`,
            xp: rewardXp,
            category: 'Missions',
            timeAgo: 'Just now',
          },
          ...prev,
        ]);

        return res.data;
      }
    } catch (err) {
      console.error('[LearningContext] Failed to complete mission on backend:', err.message);
      throw err;
    }
  }, [streakDays, updateAchievementProgress]);

  const useStreakShield = useCallback(() => {
    if (streakShields > 0) {
      setStreakShields((prev) => prev - 1);
      return true;
    }
    return false;
  }, [streakShields]);

  const resetGamification = useCallback(async () => {
    setXp(0);
    setStreakDays(0);
    setBestStreak(0);
    setDailyMissions([]);
    setXpTransactions([]);
    setLevelInfo(calculateLevelInfo(0));
    setAchievements(sampleAchievements.map(a => ({ ...a, unlocked: false, progress: 0 })));

    try {
      await gamificationApi.resetGamification();
    } catch (e) {
      console.warn('Backend gamification reset failed:', e.message);
    }
  }, []);

  const closeLevelUpModal = useCallback(() => {
    setLevelUpData(null);
  }, []);

  const contextValue = useMemo(() => ({
    xp,
    level: levelInfo.level,
    levelInfo,
    streakDays,
    bestStreak,
    weeklyConsistency,
    streakShields,
    achievements,
    dailyMissions,
    weeklyChallenge,
    xpTransactions,
    milestones,
    levelUpData,
    loading,
    syncGamificationState,
    earnXp,
    addXp: earnXp,
    completeMission,
    useStreakShield,
    closeLevelUpModal,
    resetGamification,
  }), [
    xp,
    levelInfo,
    streakDays,
    bestStreak,
    weeklyConsistency,
    streakShields,
    achievements,
    dailyMissions,
    weeklyChallenge,
    xpTransactions,
    milestones,
    levelUpData,
    loading,
    syncGamificationState,
    earnXp,
    completeMission,
    useStreakShield,
    closeLevelUpModal,
    resetGamification
  ]);

  return (
    <LearningContext.Provider value={contextValue}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => useContext(LearningContext);
