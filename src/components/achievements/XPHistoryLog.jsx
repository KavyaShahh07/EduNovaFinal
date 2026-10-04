import React, { useState } from 'react';
import { useLearning } from '../../context/LearningContext';
import { Zap, Target, Flame, Award, BookOpen } from 'lucide-react';

export const XPHistoryLog = () => {
  const { xpTransactions = [] } = useLearning();
  const [filter, setFilter] = useState('All');

  const categories = [
    { id: 'All', label: 'All', icon: Zap },
    { id: 'Learning', label: 'Learning', icon: BookOpen },
    { id: 'Quiz', label: 'Quiz', icon: Target },
    { id: 'Streak', label: 'Streak', icon: Flame },
    { id: 'Skills', label: 'Skills', icon: Award }
  ];

  // Heuristic transaction categorization filter
  const matchesCategory = (tx, targetFilter) => {
    if (targetFilter === 'All') return true;
    
    const cat = (tx.category || '').toLowerCase();
    const f = targetFilter.toLowerCase();

    // 1. Direct category match
    if (cat === f) return true;

    // 2. Intelligent fallback title classification
    const title = (tx.title || '').toLowerCase();
    if (f === 'quiz') {
      return title.includes('quiz') || title.includes('assessment') || title.includes('test') || title.includes('question') || title.includes('exam');
    }
    if (f === 'streak') {
      return title.includes('streak') || title.includes('daily') || title.includes('login') || title.includes('consistency') || title.includes('shield');
    }
    if (f === 'skills') {
      return title.includes('skill') || title.includes('project') || title.includes('lab') || title.includes('exchange') || title.includes('dsa') || title.includes('code');
    }
    if (f === 'learning') {
      return !title.includes('quiz') && !title.includes('streak') && !title.includes('skill') && !title.includes('exchange');
    }

    return false;
  };

  const filteredTxs = xpTransactions.filter((tx) => matchesCategory(tx, filter));

  return (
    <div
      style={{
        background: 'var(--glass-bg, rgba(30, 41, 59, 0.7))',
        backdropFilter: 'blur(16px)',
        borderRadius: 'var(--radius-xl, 20px)',
        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
        padding: '24px',
        boxShadow: 'var(--glass-shadow, 0 12px 32px rgba(0,0,0,0.25))'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span className="cyber-badge-cyan" style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={12} /> XP Activity Log
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', margin: '4px 0 0' }}>
            Recent XP Transactions
          </h3>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {categories.map(({ id, label, icon: Icon }) => {
            const count = xpTransactions.filter((tx) => matchesCategory(tx, id)).length;
            const isActive = filter === id;

            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: isActive
                    ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isActive
                    ? '1px solid #38bdf8'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? '0 4px 14px rgba(6, 182, 212, 0.35)' : 'none'
                }}
              >
                <Icon size={13} style={{ opacity: isActive ? 1 : 0.7 }} />
                <span>{label}</span>
                {count > 0 && (
                  <span
                    style={{
                      background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                      color: isActive ? '#fff' : 'var(--text-muted, #64748b)',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                      marginLeft: '2px'
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTxs.length > 0 ? (
          filteredTxs.map((tx) => (
            <div
              key={tx.id || `tx_${Math.random()}`}
              style={{
                background: 'var(--bg-secondary, rgba(15, 23, 42, 0.6))',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                borderRadius: 'var(--radius-md, 12px)',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'transform 0.15s ease, border-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#06b6d4',
                    flexShrink: 0
                  }}
                >
                  <Zap size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary, #f8fafc)', display: 'block' }}>
                    {tx.title}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>{tx.category || 'Learning'}</span> • {tx.timeAgo || 'Recent'}
                  </span>
                </div>
              </div>

              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.1)',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(56, 189, 248, 0.2)'
                }}
              >
                +{tx.xp} XP
              </span>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px border-dash rgba(255, 255, 255, 0.08)'
            }}
          >
            <Zap size={28} style={{ color: 'var(--text-muted, #64748b)', marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem', margin: 0 }}>
              No XP transactions recorded yet under <strong>{filter}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
