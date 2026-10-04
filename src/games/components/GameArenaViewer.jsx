import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
  Star,
  Clock,
  Layers
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { soundManager } from '../shared/SoundManager';
import { gameRewardService } from '../shared/GameRewardService';
import { SageGameAssistant } from '../shared/SageGameAssistant';
import { GameResultScreen } from './GameResultScreen';

export const GameArenaViewer = ({
  gameDef,
  onExit,
  onCreateTask,
  userProfile = null
}) => {
  const { theme } = useTheme() || {};
  const isLight = theme === 'light';

  const viewerContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameState, setGameState] = useState('PLAYING'); // 'PLAYING' | 'RESULT'
  const [gameResult, setGameResult] = useState(null);
  const [isSageOpen, setIsSageOpen] = useState(false);
  const [sessionMistakes, setSessionMistakes] = useState([]);
  const [currentChallengeContext, setCurrentChallengeContext] = useState(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else if (gameState === 'PLAYING') {
          setIsPaused(prev => !prev);
        }
      } else if (e.key.toLowerCase() === 'm' && e.altKey) {
        handleToggleSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, gameState]);

  // Handle Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleToggleSound = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleToggleFullscreen = () => {
    if (!viewerContainerRef.current) return;
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleFinishGame = async (finishData) => {
    const rewardData = await gameRewardService.recordGameCompletion({
      gameId: gameDef.id,
      gameTitle: gameDef.title,
      subject: gameDef.subject || 'General',
      score: finishData.score || 0,
      accuracy: finishData.accuracy || 100,
      durationSeconds: finishData.durationSeconds || 30,
      combo: finishData.combo || 0,
      mistakes: finishData.mistakes || sessionMistakes,
      level: finishData.level || 1,
      completed: true
    });

    setGameResult({
      ...finishData,
      gameTitle: gameDef.title,
      xpEarned: rewardData.xpEarned,
      newAchievements: rewardData.newAchievements
    });
    setGameState('RESULT');
  };

  const handlePlayAgain = () => {
    setGameState('PLAYING');
    setGameResult(null);
    setSessionMistakes([]);
    setHasAttempted(false);
  };

  // Render the specific Game Component
  const GameComponent = gameDef.component;

  return (
    <div
      ref={viewerContainerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: isLight ? 'rgba(241, 245, 249, 0.98)' : 'rgba(5, 10, 26, 0.98)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        color: isLight ? '#0f172a' : '#ffffff',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* 1. TOP ARENA HEADER */}
      <header style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: isLight ? '1px solid rgba(200, 220, 240, 0.8)' : '1px solid rgba(255, 255, 255, 0.1)',
        background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(20px)'
      }}>
        {/* Left: Back & Game Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onExit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '12px',
              background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
              border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isLight ? '#1e293b' : '#e2e8f0',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} /> Exit Arena
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: `${gameDef.accentColor || '#38bdf8'}22`,
              border: `1px solid ${gameDef.accentColor || '#38bdf8'}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              {gameDef.icon ? <gameDef.icon size={20} color={gameDef.accentColor || '#38bdf8'} /> : '🎮'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {gameDef.title}
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: gameDef.accentColor || '#38bdf8',
                  background: `${gameDef.accentColor || '#38bdf8'}18`,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: `1px solid ${gameDef.accentColor || '#38bdf8'}33`
                }}>
                  {gameDef.category || 'ARENA'}
                </span>
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                <span>Difficulty: {gameDef.difficulty || 'Medium'}</span>
                <span>•</span>
                <span>+{gameDef.xpReward || 100} XP Potential</span>
                <span>•</span>
                <span>Est. {gameDef.estimatedDuration || '2 mins'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls & Sage AI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Sage AI Assistant */}
          <SageGameAssistant
            gameTitle={gameDef.title}
            subject={gameDef.subject}
            currentQuestion={currentChallengeContext}
            userMistake={sessionMistakes[sessionMistakes.length - 1]}
            hasAttempted={hasAttempted}
            isOpen={isSageOpen}
            onToggle={() => setIsSageOpen(prev => !prev)}
          />

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Sound Off (Click to Unmute)' : 'Sound On (Click to Mute)'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: isMuted ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              color: isMuted ? '#ef4444' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
              border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isLight ? '#1e293b' : '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </header>

      {/* 2. MAIN ARENA BODY */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative'
      }}>
        {gameState === 'RESULT' ? (
          <GameResultScreen
            result={gameResult}
            onPlayAgain={handlePlayAgain}
            onExit={onExit}
            onCreateTask={onCreateTask}
            isLight={isLight}
          />
        ) : GameComponent ? (
          <GameComponent
            isPaused={isPaused}
            isMuted={isMuted}
            isLight={isLight}
            onFinish={handleFinishGame}
            onChallengeChange={(q) => setCurrentChallengeContext(q)}
            onAttempt={(mistake) => {
              setHasAttempted(true);
              if (mistake) {
                setSessionMistakes(prev => [...prev, mistake]);
              }
            }}
            userProfile={userProfile}
            onExit={onExit}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            Preparing game arena...
          </div>
        )}
      </main>
    </div>
  );
};

export default GameArenaViewer;
