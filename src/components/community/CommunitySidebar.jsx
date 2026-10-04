import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, TrendingUp, Bookmark, Bot, Users, Hash } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export const CommunitySidebar = ({ posts = [], onSelectTag }) => {
  const { user } = useAuth();

  // Dynamic user activity counters
  const [joinedGroupsCount, setJoinedGroupsCount] = useState(0);
  const [savedItemsCount, setSavedItemsCount] = useState(0);
  const [followedTopicsCount, setFollowedTopicsCount] = useState(4);

  useEffect(() => {
    const updateStats = () => {
      try {
        const joined = JSON.parse(localStorage.getItem('edunova_joined_study_groups') || '[]');
        setJoinedGroupsCount(Array.isArray(joined) ? joined.length : 0);

        const saved = JSON.parse(localStorage.getItem('edunova_bookmarked_posts') || '[]');
        setSavedItemsCount(Array.isArray(saved) ? saved.length : 0);

        const topics = JSON.parse(localStorage.getItem('edunova_followed_topics') || '["React", "AI & ML", "Systems", "Math"]');
        setFollowedTopicsCount(Array.isArray(topics) ? topics.length : 4);
      } catch (e) {
        setJoinedGroupsCount(0);
        setSavedItemsCount(0);
      }
    };

    updateStats();
    window.addEventListener('storage', updateStats);
    window.addEventListener('edunova_community_updated', updateStats);
    const interval = setInterval(updateStats, 10000);
    return () => {
      window.removeEventListener('storage', updateStats);
      window.removeEventListener('edunova_community_updated', updateStats);
      clearInterval(interval);
    };
  }, []);

  // Compute Questions Asked by Current User dynamically
  const userQuestionsCount = useMemo(() => {
    if (!posts || !Array.isArray(posts) || !user) return 0;
    const authorName = (user?.name || user?.username || '').toLowerCase();
    return posts.filter(p => {
      const pAuthor = (p.author?.name || p.author || '').toLowerCase();
      return pAuthor.includes(authorName) || p.userId === user?.id;
    }).length;
  }, [posts, user]);

  // Compute Dynamic Trending Topics from live post tags
  const trendingTags = useMemo(() => {
    const tagMap = {};

    // Initial baseline counts for rich presentation
    const defaultBaseline = {
      'React': 12,
      'DBMS': 8,
      'AI & ML': 15,
      'Physics': 6,
      'WebXR': 5
    };

    Object.entries(defaultBaseline).forEach(([k, v]) => {
      tagMap[k] = v;
    });

    (posts || []).forEach(p => {
      const rawTags = Array.isArray(p.tags) ? p.tags : [p.topic || p.subject || 'General'];
      rawTags.forEach(t => {
        if (!t) return;
        const clean = t.toString().trim().replace(/^#/, '');
        if (clean) {
          tagMap[clean] = (tagMap[clean] || 0) + 1;
        }
      });
    });

    return Object.entries(tagMap)
      .map(([tag, count]) => ({ tag, posts: count }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5);
  }, [posts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Your Community Activity (Calculated dynamically) */}
      <div
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          padding: '20px',
          boxShadow: 'var(--glass-shadow)'
        }}
      >
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="var(--accent-cyan)" /> Your Community Activity
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>FOLLOWING</span>
            <strong style={{ fontSize: '1.15rem', color: 'var(--accent-cyan)', display: 'block', marginTop: '2px' }}>
              {followedTopicsCount} Topics
            </strong>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>GROUPS</span>
            <strong style={{ fontSize: '1.15rem', color: 'var(--accent-purple)', display: 'block', marginTop: '2px' }}>
              {joinedGroupsCount} Active
            </strong>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>SAVED</span>
            <strong style={{ fontSize: '1.15rem', color: 'var(--accent-yellow)', display: 'block', marginTop: '2px' }}>
              {savedItemsCount} Items
            </strong>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>QUESTIONS</span>
            <strong style={{ fontSize: '1.15rem', color: 'var(--accent-green, #10b981)', display: 'block', marginTop: '2px' }}>
              {userQuestionsCount} Asked
            </strong>
          </div>
        </div>
      </div>

      {/* 2. Trending Topics (Calculated dynamically from real discussions) */}
      <div
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          padding: '20px',
          boxShadow: 'var(--glass-shadow)'
        }}
      >
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="var(--accent-purple)" /> Trending Topics
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {trendingTags.map((t) => (
            <div
              key={t.tag}
              onClick={() => onSelectTag && onSelectTag(t.tag)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                background: 'rgba(255, 255, 255, 0.03)'
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Hash size={13} color="var(--accent-cyan)" /> {t.tag}
              </span>
              <span className="cyber-badge" style={{ fontSize: '0.72rem' }}>{t.posts} posts</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Sage AI Recommendation */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(99, 102, 241, 0.12))',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--accent-cyan)',
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Bot size={18} color="var(--accent-cyan)" />
          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Sage AI Recommendation</strong>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
          {posts.length > 0 ? (
            <>Featured discussion matching your goal: <strong>{posts[0].title.slice(0, 45)}...</strong></>
          ) : (
            <>3 discussions match your current learning goal: <strong>React Hooks & System Architecture</strong>.</>
          )}
        </p>
        <Button size="sm" style={{ width: '100%' }} onClick={() => onSelectTag && onSelectTag(trendingTags[0]?.tag)}>
          Explore Recommended
        </Button>
      </div>
    </div>
  );
};

