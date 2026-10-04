import React from 'react';
import { Sparkles, TrendingUp, Clock, HelpCircle, Users, Award, BookOpen, FolderGit2 } from 'lucide-react';

export const CommunityNavigationTabs = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'for-you', label: 'For You', icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'latest', label: 'Latest', icon: Clock },
    { id: 'unanswered', label: 'Unanswered', icon: HelpCircle },
    { id: 'groups', label: 'Study Groups', icon: Users },
    { id: 'mentors', label: 'Mentors & Partners', icon: Award },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'projects', label: 'Projects Showcase', icon: FolderGit2 }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '20px',
        overflowX: 'auto',
        overflowY: 'hidden',
        minWidth: 0
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-lg, 12px)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)'
                : 'rgba(255, 255, 255, 0.04)',
              border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
              color: isActive ? '#38bdf8' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: isActive ? 700 : 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: isActive ? '0 4px 14px rgba(6, 182, 212, 0.25)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Icon size={15} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
