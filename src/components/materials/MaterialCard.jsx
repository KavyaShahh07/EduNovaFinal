import React, { useState } from 'react';
import { BookOpen, FileText, HelpCircle, Layers, Sparkles, Eye, Video, PlayCircle, Trash2, FileCheck, Award, Image as ImageIcon } from 'lucide-react';

export const MaterialCard = ({ material, onView, onAskSage, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isVideo = material.type?.toUpperCase() === 'VIDEOS' || material.type?.toUpperCase() === 'VIDEO' || (material.fileUrl && material.fileUrl.match(/\.(mp4|webm|mov|mkv|avi|m4v)$/i));

  const getTypeStyle = () => {
    if (isVideo) {
      return {
        icon: <Video size={16} color="#f43f5e" />,
        bg: 'rgba(244, 63, 94, 0.12)',
        border: 'rgba(244, 63, 94, 0.35)',
        color: '#fb7185',
        glow: 'rgba(244, 63, 94, 0.25)'
      };
    }
    switch (material.type) {
      case 'Notes':
        return {
          icon: <FileText size={16} color="#38bdf8" />,
          bg: 'rgba(56, 189, 248, 0.12)',
          border: 'rgba(56, 189, 248, 0.35)',
          color: '#38bdf8',
          glow: 'rgba(56, 189, 248, 0.25)'
        };
      case 'Study Guides':
        return {
          icon: <BookOpen size={16} color="#818cf8" />,
          bg: 'rgba(129, 140, 248, 0.12)',
          border: 'rgba(129, 140, 248, 0.35)',
          color: '#a5b4fc',
          glow: 'rgba(129, 140, 248, 0.25)'
        };
      case 'Formula Sheets':
        return {
          icon: <Award size={16} color="#fbbf24" />,
          bg: 'rgba(251, 191, 36, 0.12)',
          border: 'rgba(251, 191, 36, 0.35)',
          color: '#fcd34d',
          glow: 'rgba(251, 191, 36, 0.25)'
        };
      case 'Flashcards':
        return {
          icon: <Layers size={16} color="#c084fc" />,
          bg: 'rgba(192, 132, 252, 0.12)',
          border: 'rgba(192, 132, 252, 0.35)',
          color: '#e9d5ff',
          glow: 'rgba(192, 132, 252, 0.25)'
        };
      case 'MCQs':
        return {
          icon: <HelpCircle size={16} color="#34d399" />,
          bg: 'rgba(52, 211, 153, 0.12)',
          border: 'rgba(52, 211, 153, 0.35)',
          color: '#6ee7b7',
          glow: 'rgba(52, 211, 153, 0.25)'
        };
      case 'Practice Questions':
        return {
          icon: <FileCheck size={16} color="#38bdf8" />,
          bg: 'rgba(56, 189, 248, 0.12)',
          border: 'rgba(56, 189, 248, 0.35)',
          color: '#7dd3fc',
          glow: 'rgba(56, 189, 248, 0.25)'
        };
      case 'Diagrams':
        return {
          icon: <ImageIcon size={16} color="#fb923c" />,
          bg: 'rgba(251, 146, 60, 0.12)',
          border: 'rgba(251, 146, 60, 0.35)',
          color: '#ffedd5',
          glow: 'rgba(251, 146, 60, 0.25)'
        };
      default:
        return {
          icon: <FileText size={16} color="#38bdf8" />,
          bg: 'rgba(6, 182, 212, 0.12)',
          border: 'rgba(6, 182, 212, 0.35)',
          color: '#38bdf8',
          glow: 'rgba(6, 182, 212, 0.25)'
        };
    }
  };

  const styleMeta = getTypeStyle();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered
          ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)'
          : 'linear-gradient(145deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '20px',
        border: isHovered
          ? `1px solid ${styleMeta.color}`
          : '1px solid rgba(255, 255, 255, 0.12)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-5px)' : 'none',
        boxShadow: isHovered
          ? `0 16px 40px -10px ${styleMeta.glow}, 0 0 20px rgba(0, 0, 0, 0.5)`
          : '0 8px 32px rgba(0, 0, 0, 0.37)'
      }}
    >
      <div>
        {/* Top Header Badge & Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '9999px',
            background: styleMeta.bg,
            border: `1px solid ${styleMeta.border}`,
            backdropFilter: 'blur(8px)'
          }}>
            {styleMeta.icon}
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: styleMeta.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {material.type}
            </span>
          </div>

          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            {material.createdAt || 'Recent'}
          </span>
        </div>

        {/* Title */}
        <h4 style={{
          fontSize: '1.05rem',
          fontWeight: 800,
          color: '#f8fafc',
          margin: '0 0 8px',
          lineHeight: 1.4,
          letterSpacing: '-0.2px'
        }}>
          {material.title}
        </h4>

        {/* Description */}
        <p style={{
          fontSize: '0.84rem',
          color: '#cbd5e1',
          lineHeight: 1.55,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {material.description}
        </p>

        {/* Tags */}
        {material.tags && Array.isArray(material.tags) && material.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '14px' }}>
            {material.tags.map(t => {
              if (t === 'target:all_students') {
                return (
                  <span key={t} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 10px', borderRadius: '9999px' }}>
                    📢 All Students
                  </span>
                );
              }
              if (t.startsWith('target:')) {
                return (
                  <span key={t} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#c084fc', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '3px 10px', borderRadius: '9999px' }}>
                    🎯 Targeted Delivery
                  </span>
                );
              }
              return (
                <span key={t} style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '3px 9px', borderRadius: '9999px' }}>
                  #{t}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
        <button
          onClick={() => onView(material)}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '9px 16px',
            borderRadius: '12px',
            fontSize: '0.84rem',
            fontWeight: 800,
            background: isVideo
              ? 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)'
              : 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: isVideo
              ? '0 4px 14px rgba(225, 29, 72, 0.4)'
              : '0 4px 14px rgba(2, 132, 199, 0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          {isVideo ? <><PlayCircle size={15} /> Watch Video</> : <><Eye size={15} /> Open Material</>}
        </button>

        <button
          onClick={() => onAskSage(material)}
          title="Ask Sage AI about this material"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 14px',
            borderRadius: '12px',
            fontSize: '0.84rem',
            fontWeight: 700,
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            color: '#38bdf8',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.2)'
          }}
        >
          <Sparkles size={14} style={{ color: '#38bdf8' }} /> Sage AI
        </button>

        {onDelete && (
          <button
            onClick={() => onDelete(material)}
            title="Delete material"
            style={{
              padding: '9px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MaterialCard;

