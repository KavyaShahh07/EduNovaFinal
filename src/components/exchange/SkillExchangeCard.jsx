import React, { useState } from 'react';
import {
  CheckCircle,
  Star,
  Clock,
  Globe,
  Repeat,
  Sparkles,
  Heart,
  Send,
  Eye,
  GraduationCap,
  Zap,
  Radio
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { WhyMatchModal } from './WhyMatchModal';
import { getDynamicAvatar, getInitialsAvatar } from '../../utils/avatarUtils';

export const SkillExchangeCard = ({
  candidate,
  isSaved,
  onSaveToggle,
  onRequestExchange,
  onViewProfile
}) => {
  const { theme } = useTheme() || {};
  const isLight = theme === 'light';
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);

  if (!candidate) return null;

  const teachList = candidate.skillsToTeach || [];
  const learnList = candidate.skillsToLearn || [];
  const isOwn = candidate.isOwnListing;
  const matchScore = candidate.matchScore || 96;

  const avatarSrc = getDynamicAvatar(candidate.avatar || candidate, candidate.name);

  return (
    <>
      <div className={`se-match-card ${isOwn ? 'se-match-card-own' : ''}`}>
        <div>
          {/* Own Live Listing Banner */}
          {isOwn && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              borderRadius: '12px',
              background: isLight ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)' : 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="se-pulse-indicator" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isLight ? '#0284c7' : '#38bdf8', letterSpacing: '0.04em' }}>
                  YOUR LIVE OFFER • BROADCASTED
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: isLight ? '#475569' : '#94a3b8', fontWeight: 700 }}>
                Visible to Peers
              </span>
            </div>
          )}

          {/* Top Info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={avatarSrc}
                  alt={candidate.name}
                  className="se-card-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getInitialsAvatar(candidate.name);
                  }}
                />
                {candidate.verified && (
                  <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#06b6d4', borderRadius: '50%', padding: '2px', display: 'flex' }} title="Verified Peer">
                    <CheckCircle size={12} color="#050814" strokeWidth={3} />
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <h3 className="se-card-name">{candidate.name}</h3>
                  {candidate.isMentor && (
                    <span className="se-tag-purple" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                      🎓 Mentor
                    </span>
                  )}
                  {candidate.isCommunityListing && !isOwn && (
                    <span className="se-tag-cyan" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                      🌟 Community
                    </span>
                  )}
                </div>
                <p className="se-card-title">{candidate.education || candidate.title}</p>
              </div>
            </div>

            {/* Match Score */}
            <button
              onClick={() => setIsWhyModalOpen(true)}
              className="se-match-score-badge"
              title="Click to view AI compatibility factors"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} color={isLight ? '#0284c7' : '#38bdf8'} />
                <span>{matchScore}% Match</span>
              </div>
              <span style={{ fontSize: '0.65rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: 600 }}>Why match?</span>
            </button>
          </div>

          {/* Reciprocal Swap Highlight */}
          {candidate.isReciprocalSwap && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '12px',
              background: isLight ? 'rgba(16, 185, 129, 0.12)' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: isLight ? '#047857' : '#34d399',
              fontSize: '0.78rem',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Repeat size={14} color={isLight ? '#047857' : '#34d399'} />
              <span><strong>Skill Swap:</strong> Perfect 2-Way Match!</span>
            </div>
          )}

          {/* Bio */}
          <p className="se-card-bio">
            "{candidate.bio}"
          </p>

          {/* Skills Teaches / Wants */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isLight ? '#475569' : '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Teaches:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {teachList.map((st, i) => (
                  <span key={i} className="se-tag-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={11} />
                    {typeof st === 'string' ? st : st.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isLight ? '#475569' : '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Wants to Learn:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {learnList.map((sl, i) => (
                  <span key={i} className="se-tag-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={11} />
                    {typeof sl === 'string' ? sl : sl.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="se-card-meta-grid">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color={isLight ? '#0284c7' : '#38bdf8'} />
              <span>{candidate.availability}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} color={isLight ? '#7e22ce' : '#c084fc'} />
              <span>{(candidate.languages || ['English']).join(', ')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={14} color="#fbbf24" />
              <span>{candidate.rating || 5.0} ({candidate.completedExchanges || 0} exchanges)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GraduationCap size={14} color={isLight ? '#047857' : '#34d399'} />
              <span>{candidate.experience}</span>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={() => onSaveToggle(candidate.id)}
            className="se-btn se-btn-secondary"
            style={{ padding: '8px 12px' }}
            title={isSaved ? 'Remove from Saved' : 'Save Match'}
          >
            <Heart size={16} color={isSaved ? '#f43f5e' : '#94a3b8'} fill={isSaved ? '#f43f5e' : 'none'} />
          </button>

          <button
            onClick={() => onViewProfile(candidate)}
            className="se-btn se-btn-secondary"
            style={{ padding: '8px 12px' }}
            title="View Profile Details"
          >
            <Eye size={16} />
          </button>

          {isOwn ? (
            <button
              disabled
              className="se-btn se-btn-active-status"
              style={{ flex: 1, padding: '10px 14px' }}
              title="Your offer is broadcasted to the entire EduNova student community"
            >
              <Zap size={14} />
              Active in Marketplace
            </button>
          ) : (
            <button
              onClick={() => onRequestExchange(candidate)}
              className="se-btn se-btn-primary"
              style={{ flex: 1, padding: '10px 14px', color: '#ffffff' }}
            >
              <Send size={14} />
              Request Exchange
            </button>
          )}
        </div>
      </div>

      <WhyMatchModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
        candidate={candidate}
      />
    </>
  );
};
