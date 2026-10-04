import React, { useState } from 'react';
import {
  Gauge,
  Flame,
  Zap,
  Trophy,
  Award,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  Bot,
  Compass,
  Star
} from 'lucide-react';
import { GameCard } from './GameCard';

export const ARCADE_GARAGE_CATEGORIES = [
  'All 3D Games',
  'Car Racing',
  'Bike Racing',
  'Stunts & Drifting',
  'Open World',
  'Funny Physics',
  'Endless Runner',
  'Daily Challenges'
];

export const ArcadeGarageSection = ({
  garageGames = [],
  getPersonalBestForGame = () => null,
  onLaunchGame = () => {},
  isLight = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All 3D Games');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGarageGames = garageGames.filter(g => {
    // 1. Category Filter
    let matchesCategory = true;
    if (selectedCategory === 'Car Racing') {
      matchesCategory = g.category === 'CAR RACING' || g.categories?.includes('CAR RACING') || g.title.toLowerCase().includes('car') || g.title.toLowerCase().includes('city') || g.title.toLowerCase().includes('highway') || g.title.toLowerCase().includes('parking') || g.title.toLowerCase().includes('copilot');
    } else if (selectedCategory === 'Bike Racing') {
      matchesCategory = g.category === 'BIKE RACING' || g.categories?.includes('BIKE RACING') || g.title.toLowerCase().includes('bike') || g.title.toLowerCase().includes('bmx') || g.title.toLowerCase().includes('motorcycle') || g.title.toLowerCase().includes('delivery');
    } else if (selectedCategory === 'Stunts & Drifting') {
      matchesCategory = g.category === 'STUNTS & DRIFTING' || g.categories?.includes('STUNTS & DRIFTING') || g.title.toLowerCase().includes('drift') || g.title.toLowerCase().includes('stunt');
    } else if (selectedCategory === 'Open World') {
      matchesCategory = g.category === 'OPEN WORLD' || g.categories?.includes('OPEN WORLD') || g.title.toLowerCase().includes('open road') || g.title.toLowerCase().includes('off-road') || g.title.toLowerCase().includes('playground');
    } else if (selectedCategory === 'Funny Physics') {
      matchesCategory = g.category === 'FUNNY PHYSICS' || g.categories?.includes('FUNNY PHYSICS') || g.title.toLowerCase().includes('wobbly') || g.title.toLowerCase().includes('tiny car') || g.title.toLowerCase().includes('toilet') || g.title.toLowerCase().includes('ragdoll') || g.title.toLowerCase().includes('crash');
    } else if (selectedCategory === 'Endless Runner') {
      matchesCategory = g.category === 'ENDLESS RUNNER' || g.categories?.includes('ENDLESS RUNNER') || g.title.toLowerCase().includes('tunnel') || g.title.toLowerCase().includes('monster') || g.title.toLowerCase().includes('boulder');
    } else if (selectedCategory === 'Daily Challenges') {
      matchesCategory = g.badge?.includes('DAILY') || g.xpReward >= 140;
    }

    // 2. Search Query
    if (!searchQuery.trim()) return matchesCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.category?.toLowerCase().includes(q) ||
      g.skills?.some(s => s.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <section
      style={{
        background: isLight
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(240, 246, 255, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(10, 15, 35, 0.95) 100%)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: isLight ? '1.5px solid rgba(255, 255, 255, 0.98)' : '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '28px',
        padding: '28px',
        marginBottom: '36px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%',
        boxShadow: isLight
          ? '0 16px 45px rgba(64, 100, 160, 0.12), inset 0 1.5px 2px rgba(255, 255, 255, 1)'
          : '0 16px 45px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* GARAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
        <div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.15)',
            padding: '4px 12px',
            borderRadius: '9999px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            marginBottom: '6px'
          }}>
            <Gauge size={14} color="#38bdf8" /> ✦ EDUNOVA 3D ARCADE GARAGE
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: isLight ? '#0f172a' : '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
            🏎️ 3D Arcade Garage & Physics Arena
          </h2>
          <p style={{ fontSize: '0.88rem', color: isLight ? '#475569' : '#94a3b8', margin: '4px 0 0' }}>
            Immersive 3D car racing, bike stunts, off-road exploration, and funny physics simulation games.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%', boxSizing: 'border-box' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search 3D garage games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px 10px 40px',
              borderRadius: '14px',
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
              border: isLight ? '1.5px solid rgba(200, 218, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.16)',
              color: isLight ? '#0f172a' : '#ffffff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* CATEGORY PILLS */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '16px', marginBottom: '20px', scrollbarWidth: 'none', boxSizing: 'border-box' }}>
        {ARCADE_GARAGE_CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: isSelected ? 800 : 600,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                background: isSelected
                  ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                  : (isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.06)'),
                color: isSelected ? '#ffffff' : (isLight ? '#475569' : '#cbd5e1'),
                border: isSelected
                  ? 'none'
                  : (isLight ? '1px solid rgba(200, 218, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.12)'),
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isSelected ? '0 4px 14px rgba(2, 132, 199, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3D GARAGE GAMES GRID */}
      {filteredGarageGames.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: isLight ? '#64748b' : '#94a3b8' }}>
          No 3D Arcade games match your active search filter.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
          {filteredGarageGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              personalBest={getPersonalBestForGame(game.id)}
              onLaunch={onLaunchGame}
              isLight={isLight}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ArcadeGarageSection;
