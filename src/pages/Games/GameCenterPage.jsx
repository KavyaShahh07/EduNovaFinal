import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Zap,
  Layers,
  Puzzle,
  ArrowUp,
  Bug,
  Sword,
  Flame,
  Trophy,
  Award,
  Sparkles,
  Play,
  RotateCcw,
  CheckSquare,
  History,
  FlaskConical,
  Search,
  Filter,
  Loader2,
  Gauge,
  Compass,
  Rocket
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { EduNovaHeroBanner } from '../../components/common/EduNovaHeroBanner';
import { gameService } from '../../services/gameService';
import { taskService } from '../../services/taskService';
import { gameRewardService } from '../../games/shared/GameRewardService';

// Master Registry & Components
import { GAME_REGISTRY, GAME_CATEGORIES, filterGames } from '../../games/registry/GameRegistry';
import { GameCard } from '../../games/components/GameCard';
import { DailyChallengeBanner } from '../../games/components/DailyChallengeBanner';
import { ContinuePlayingWidget } from '../../games/components/ContinuePlayingWidget';
import { GameArenaViewer } from '../../games/components/GameArenaViewer';

// Preserved Existing Game Modals
import { DailyChallengeModal } from '../../components/games/DailyChallengeModal';
import { RapidFireGameModal } from '../../components/games/RapidFireGameModal';
import { MemoryMatchGameModal } from '../../components/games/MemoryMatchGameModal';
import { ConceptMatchGameModal } from '../../components/games/ConceptMatchGameModal';
import { SortItGameModal } from '../../components/games/SortItGameModal';
import { FixMistakeGameModal } from '../../components/games/FixMistakeGameModal';
import { BossBattleGameModal } from '../../components/games/BossBattleGameModal';
import { FormulaRushGameModal } from '../../components/games/FormulaRushGameModal';
import { LabSimulatorGameModal } from '../../components/games/LabSimulatorGameModal';
import { GameResultModal } from '../../components/games/GameResultModal';

export const GameCenterPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme() || {};
  const isLight = theme === 'light';
  const { user } = useAuth() || {};

  const [bests, setBests] = useState({ highScore: 0, highestAccuracy: 0, totalGames: 0, currentStreak: 1 });
  const [history, setHistory] = useState([]);

  // Main Arena Mode: 'ALL' | '3D_GARAGE' | 'STEM_BRAIN'
  const [activeArenaMode, setActiveArenaMode] = useState('3D_GARAGE');

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active game states
  const [activeGameModal, setActiveGameModal] = useState(null); // 'DAILY' | 'RAPID' | etc.
  const [activeArenaGame, setActiveArenaGame] = useState(null); // Full GameDefinition
  const [activeResult, setActiveResult] = useState(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      const [bestsData, historyData] = await Promise.all([
        gameService.getPersonalBests(),
        gameService.getResults(),
      ]);
      if (bestsData) setBests(bestsData);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (e) {
      console.error('Failed to load game center data:', e);
      setHistory([]);
    }
  };

  const handleGameFinish = async (result) => {
    setActiveGameModal(null);
    const saved = await gameService.saveGameResult(result);
    setActiveResult(saved);
    setIsResultOpen(true);
    await loadGameData();
  };

  const handleLaunchGame = (gameDef) => {
    if (gameDef.isLegacyModal && gameDef.legacyKey) {
      setActiveGameModal(gameDef.legacyKey);
    } else {
      setActiveArenaGame(gameDef);
    }
  };

  const getPersonalBestForGame = (gameId) => {
    if (!Array.isArray(history) || history.length === 0) return null;
    const matches = history.filter(h =>
      (h.gameId && h.gameId.toLowerCase().includes(gameId.toLowerCase())) ||
      (gameId && gameId.toLowerCase().includes(h.gameId?.toLowerCase()))
    );
    if (matches.length === 0) return null;
    return matches.reduce((max, h) => (h.score > (max.score || 0) ? h : max), matches[0]);
  };

  const handleCreateTaskFromGame = (res) => {
    taskService.createTask({
      title: `Revision Task: ${res.gameTitle || 'Subject Practice'}`,
      subject: res.subject || 'Physics',
      type: 'Revision',
      priority: 'HIGH',
      dueDate: new Date().toISOString().split('T')[0],
      notes: `Created from Game Center result. Accuracy achieved: ${res.accuracy}%.`
    });
    navigate('/tasks');
  };

  // Filter logic based on active mode, category, and search query
  const displayedGames = GAME_REGISTRY.filter(g => {
    // 1. Arena Mode Filter
    if (activeArenaMode === '3D_GARAGE' && !g.categories?.includes('3D GARAGE')) {
      return false;
    }
    if (activeArenaMode === 'STEM_BRAIN' && g.categories?.includes('3D GARAGE')) {
      return false;
    }

    // 2. Category Pill Filter
    if (selectedCategory !== 'ALL') {
      const catUpper = selectedCategory.toUpperCase();
      const matchesCategory =
        g.category?.toUpperCase() === catUpper ||
        (g.categories && g.categories.some(c => c.toUpperCase() === catUpper));
      if (!matchesCategory) return false;
    }

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        (g.subject && g.subject.toLowerCase().includes(q)) ||
        (g.skills && g.skills.some(s => s.toLowerCase().includes(q))) ||
        (g.category && g.category.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    return true;
  });

  const mostRecentGame = Array.isArray(history) && history.length > 0 ? history[0] : null;

  // Category Pills dynamically tailored to mode
  const currentCategories = activeArenaMode === '3D_GARAGE'
    ? ['ALL', 'CAR RACING', 'BIKE RACING', 'STUNTS & DRIFTING', 'OPEN WORLD', 'FUNNY PHYSICS', 'ENDLESS RUNNER']
    : activeArenaMode === 'STEM_BRAIN'
    ? ['ALL', 'REACTION', 'MEMORY', 'LOGIC', 'MATH', 'SCIENCE', 'CODING', 'LANGUAGE', 'STRATEGY', 'BOSS BATTLES']
    : GAME_CATEGORIES;

  return (
    <div style={{
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 0 40px 0',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* 1. HERO GLASS BANNER */}
      <div style={{ marginBottom: '24px' }}>
        <EduNovaHeroBanner
          badge="✦ EduNova Gamified Learning Arena & 3D Arcade Garage"
          title="🎮 EduNova Game Center Arena"
          subtitle="Don't just study it. Play it. Drive it. Master it. Explore 49 high-octane 3D car racing, bike stunts, funny physics, and STEM arena games."
          actions={
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setActiveGameModal('DAILY')}
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
                  letterSpacing: '-0.01em'
                }}
              >
                <Flame size={16} color="#ffffff" fill="rgba(255, 255, 255, 0.25)" />
                <span>Play Daily Challenge</span>
              </button>
            </div>
          }
          stats={[
            { label: bests.totalGames, subtext: 'Games Completed', icon: Gamepad2, color: '#38bdf8', iconBg: 'rgba(56, 189, 248, 0.2)' },
            { label: `${bests.highestAccuracy}%`, subtext: 'Highest Accuracy', icon: Trophy, color: '#10b981', iconBg: 'rgba(16, 185, 129, 0.2)' },
            { label: bests.highScore ? `${bests.highScore} pts` : '0 pts', subtext: 'High Score', icon: Award, color: '#c084fc', iconBg: 'rgba(192, 132, 252, 0.2)' },
            { label: `${bests.currentStreak || 1} Days`, subtext: 'Game Streak', icon: Flame, color: '#f59e0b', iconBg: 'rgba(245, 158, 11, 0.2)' }
          ]}
        />
      </div>

      {/* 2. TODAY'S DAILY CHALLENGE BANNER */}
      <DailyChallengeBanner
        streak={bests.currentStreak || 1}
        onPlayDaily={() => setActiveGameModal('DAILY')}
        isLight={isLight}
      />

      {/* 3. CONTINUE PLAYING WIDGET */}
      <ContinuePlayingWidget
        recentGame={mostRecentGame}
        onContinue={(g) => {
          const matched = GAME_REGISTRY.find(reg => reg.id === g.gameId || reg.title === g.gameTitle);
          if (matched) handleLaunchGame(matched);
          else setActiveGameModal('RAPID');
        }}
        isLight={isLight}
      />

      {/* 4. UNIFIED ARENA MODE TABS & FILTERS */}
      <div style={{
        background: isLight
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(240, 246, 255, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(10, 15, 35, 0.95) 100%)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: isLight ? '1.5px solid rgba(255, 255, 255, 0.98)' : '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '28px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%',
        boxShadow: isLight
          ? '0 16px 45px rgba(64, 100, 160, 0.12)'
          : '0 16px 45px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Arena Mode Switcher Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', width: '100%', boxSizing: 'border-box' }}>
          <button
            onClick={() => { setActiveArenaMode('3D_GARAGE'); setSelectedCategory('ALL'); }}
            style={{
              flex: '1 1 180px',
              padding: '12px 16px',
              borderRadius: '16px',
              background: activeArenaMode === '3D_GARAGE'
                ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                : isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
              color: activeArenaMode === '3D_GARAGE' ? '#ffffff' : isLight ? '#0f172a' : '#94a3b8',
              border: activeArenaMode === '3D_GARAGE' ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeArenaMode === '3D_GARAGE' ? '0 8px 24px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Gauge size={18} /> <span>3D Arcade Garage (20)</span>
          </button>

          <button
            onClick={() => { setActiveArenaMode('STEM_BRAIN'); setSelectedCategory('ALL'); }}
            style={{
              flex: '1 1 180px',
              padding: '12px 16px',
              borderRadius: '16px',
              background: activeArenaMode === 'STEM_BRAIN'
                ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                : isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
              color: activeArenaMode === 'STEM_BRAIN' ? '#ffffff' : isLight ? '#0f172a' : '#94a3b8',
              border: activeArenaMode === 'STEM_BRAIN' ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeArenaMode === 'STEM_BRAIN' ? '0 8px 24px rgba(124, 58, 237, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={18} /> <span>STEM Arena (29)</span>
          </button>

          <button
            onClick={() => { setActiveArenaMode('ALL'); setSelectedCategory('ALL'); }}
            style={{
              flex: '1 1 150px',
              padding: '12px 16px',
              borderRadius: '16px',
              background: activeArenaMode === 'ALL'
                ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                : isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
              color: activeArenaMode === 'ALL' ? '#ffffff' : isLight ? '#0f172a' : '#94a3b8',
              border: activeArenaMode === 'ALL' ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeArenaMode === 'ALL' ? '0 8px 24px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Gamepad2 size={18} /> <span>All Games (49)</span>
          </button>
        </div>

        {/* Single Unified Search Bar */}
        <div style={{ position: 'relative', marginBottom: '16px', width: '100%', boxSizing: 'border-box' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 49 games by title, subject, category, skill..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '14px 16px 14px 46px',
              borderRadius: '16px',
              background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.72)',
              border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.14)',
              color: isLight ? '#0f172a' : '#ffffff',
              fontSize: '0.92rem',
              outline: 'none',
              backdropFilter: 'blur(20px)',
              boxShadow: isLight ? '0 4px 14px rgba(0,0,0,0.03)' : '0 6px 20px rgba(0,0,0,0.3)'
            }}
          />
        </div>

        {/* Sub-Category Pill Filters */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {currentCategories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  background: isSelected
                    ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                    : isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.06)',
                  border: isSelected
                    ? 'none'
                    : isLight ? '1px solid rgba(200, 220, 240, 0.8)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isSelected ? '#ffffff' : isLight ? '#475569' : '#cbd5e1',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.35)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. UNIFIED GAME ARENA GRID */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
          {activeArenaMode === '3D_GARAGE' ? '🏎️ 3D Arcade Garage' : activeArenaMode === 'STEM_BRAIN' ? '🧠 STEM & Brain Arena' : '🎮 All Games'} ({displayedGames.length} Games)
        </h3>
        <span style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : '#94a3b8' }}>
          Category: <strong>{selectedCategory}</strong>
        </span>
      </div>

      {displayedGames.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.5)',
          borderRadius: '24px',
          border: isLight ? '1px dashed rgba(200, 220, 240, 0.8)' : '1px dashed rgba(255, 255, 255, 0.12)',
          color: isLight ? '#64748b' : '#94a3b8',
          marginBottom: '36px'
        }}>
          No learning games match your active filters. Try searching for another topic or switch to "ALL".
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}>
          {displayedGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              personalBest={getPersonalBestForGame(game.id)}
              onLaunch={handleLaunchGame}
              isLight={isLight}
            />
          ))}
        </div>
      )}

      {/* 6. GAME HISTORY */}
      <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: isLight ? '#0f172a' : '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <History size={22} color="#38bdf8" /> Recent Game History
      </h3>

      <div style={{
        background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(28px)',
        border: isLight ? '1.5px solid rgba(200, 220, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '24px',
        padding: '20px 24px'
      }}>
        {(!Array.isArray(history) || history.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: isLight ? '#64748b' : '#94a3b8' }}>
            No game records yet. Play your first game above to establish your personal record!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(Array.isArray(history) ? history : []).slice(0, 5).map(h => (
              <div
                key={h.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: isLight ? '#ffffff' : 'rgba(255,255,255,0.04)'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.92rem', color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>
                    {h.gameTitle}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                    {h.subject || 'STEM'} • Accuracy: {h.accuracy}% • {h.durationSeconds ? `${h.durationSeconds}s` : ''}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#38bdf8', display: 'block' }}>{h.score} pts</strong>
                  <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 800 }}>+{h.xpEarned} XP</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. IMMERSIVE ARENA VIEWER FOR NEW GAMES */}
      {activeArenaGame && (
        <Suspense fallback={
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 10, 26, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
            gap: '12px',
            fontSize: '1.1rem',
            fontWeight: 700
          }}>
            <Loader2 size={24} className="animate-spin" />
            <span>Preparing arena challenge...</span>
          </div>
        }>
          <GameArenaViewer
            gameDef={activeArenaGame}
            userProfile={user}
            onExit={() => {
              setActiveArenaGame(null);
              loadGameData();
            }}
            onCreateTask={handleCreateTaskFromGame}
          />
        </Suspense>
      )}

      {/* 8. PRESERVED LEGACY MODALS FOR EXISTING GAMES */}
      <DailyChallengeModal
        isOpen={activeGameModal === 'DAILY'}
        onClose={() => setActiveGameModal(null)}
        onFinish={handleGameFinish}
      />

      <RapidFireGameModal
        isOpen={activeGameModal === 'RAPID'}
        onClose={() => setActiveGameModal(null)}
        onFinish={handleGameFinish}
      />

      <MemoryMatchGameModal
        isOpen={activeGameModal === 'MEMORY'}
        onClose={() => setActiveGameModal(null)}
        onFinish={handleGameFinish}
      />

      <ConceptMatchGameModal
        isOpen={activeGameModal === 'CONCEPT'}
        onClose={() => setActiveGameModal(null)}
        onFinish={handleGameFinish}
      />

      <SortItGameModal
        isOpen={activeGameModal === 'SORT'}
        onClose={() => setActiveGameModal(null)}
        onFinish={handleGameFinish}
      />

      <FixMistakeGameModal
        isOpen={activeGameModal === 'FIX'}
        onClose={() => setActiveGameModal(null)}
        onFinish={handleGameFinish}
      />

      <BossBattleGameModal
        isOpen={activeGameModal === 'BOSS'}
        onClose={() => setActiveGameModal(null)}
        onFinish={handleGameFinish}
      />

      <FormulaRushGameModal
        isOpen={activeGameModal === 'FORMULA'}
        onClose={() => setActiveGameModal(null)}
        onFinish={handleGameFinish}
      />

      <LabSimulatorGameModal
        isOpen={activeGameModal === 'LAB'}
        onClose={() => setActiveGameModal(null)}
        onFinish={handleGameFinish}
      />

      <GameResultModal
        isOpen={isResultOpen}
        onClose={() => setIsResultOpen(false)}
        result={activeResult}
        onRetry={() => {
          setIsResultOpen(false);
          const matched = GAME_REGISTRY.find(reg => reg.id === activeResult?.gameId || reg.title === activeResult?.gameTitle);
          if (matched) handleLaunchGame(matched);
          else setActiveGameModal('RAPID');
        }}
        onCreateTask={handleCreateTaskFromGame}
      />
    </div>
  );
};

export default GameCenterPage;
