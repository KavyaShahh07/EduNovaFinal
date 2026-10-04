import React, { useState, useRef } from 'react';
import { X, BookOpen, Brain, Download, Share2, Sparkles, FileText, Check, Plus, Video, Play, FastForward } from 'lucide-react';
import { Button } from '../common/Button';
import { FlashcardViewer } from './FlashcardViewer';
import { PdfDocumentViewer } from './PdfDocumentViewer';
import { subjectService } from '../../services/subjectService';
import { noteApi, getFileUrl } from '../../lib/apiClient';

export const MaterialViewer = ({ material, onClose, onAskSage }) => {
  const [savedToNotes, setSavedToNotes] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);

  if (!material) return null;

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleSaveToPersonalNotes = () => {
    subjectService.savePersonalNote({
      subjectId: material.subjectId || 'general',
      subjectName: material.subjectName || 'General',
      title: `Note: ${material.title}`,
      content: material.content || material.description || 'Saved study material reference.',
      category: material.type || 'Study Guide',
      color: '#06b6d4',
      tags: material.tags || ['SavedMaterial']
    });

    noteApi.createNote({
      title: `Material: ${material.title}`,
      content: material.content || material.description || 'Saved study material reference.',
      category: material.type || 'Study Guide',
      tags: material.tags || ['SavedMaterial']
    }).catch(err => {
      console.warn('Could not sync material to backend notes:', err.message);
    });

    setSavedToNotes(true);
    setTimeout(() => setSavedToNotes(false), 2500);
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isFullscreen ? '0' : '20px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary, linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%))',
          border: isFullscreen ? 'none' : '1px solid var(--border-color, rgba(255, 255, 255, 0.16))',
          borderRadius: isFullscreen ? '0' : '24px',
          width: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : 'auto',
          maxWidth: isFullscreen ? '100vw' : '960px',
          maxHeight: isFullscreen ? '100vh' : '92vh',
          overflowY: 'auto',
          padding: isFullscreen ? '12px' : '24px',
          boxShadow: isFullscreen ? 'none' : '0 24px 70px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          gap: isFullscreen ? '12px' : '20px',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: 'var(--text-accent, #38bdf8)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
              display: 'inline-block'
            }}>
              {material.type}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '4px 0 6px', color: 'var(--text-primary, #f8fafc)', letterSpacing: '-0.3px' }}>
              {material.title}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>
              Uploaded by <strong style={{ color: 'var(--text-primary, #cbd5e1)' }}>{material.uploadedBy || 'EduNova Faculty'}</strong> • {material.createdAt}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--glass-bg, rgba(255, 255, 255, 0.08))',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
              color: 'var(--text-primary, #cbd5e1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--glass-bg, rgba(255, 255, 255, 0.08))';
              e.currentTarget.style.color = 'var(--text-primary, #cbd5e1)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Render */}
        {material.svgContent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <div
              style={{
                width: '100%',
                maxWidth: '540px',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
              }}
              dangerouslySetInnerHTML={{ __html: material.svgContent }}
            />
            {material.description && (
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                {material.description}
              </p>
            )}
          </div>
        ) : material.fileUrl && (material.type?.toUpperCase() === 'VIDEOS' || material.type?.toUpperCase() === 'VIDEO' || material.fileUrl.match(/\.(mp4|webm|mov|mkv|avi|m4v)$/i)) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <video
                ref={videoRef}
                controls
                src={getFileUrl(material.fileUrl)}
                style={{
                  width: '100%',
                  maxHeight: '440px',
                  borderRadius: '16px',
                  background: '#040711',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)'
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Playback Speed Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '10px 16px',
              borderRadius: '14px',
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FastForward size={14} color="#38bdf8" /> Playback Speed:
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      background: playbackSpeed === speed
                        ? 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: playbackSpeed === speed ? '#ffffff' : '#94a3b8',
                      border: playbackSpeed === speed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer'
                    }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {material.description && (
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>
                {material.description}
              </p>
            )}
          </div>
        ) : material.type === 'Flashcards' && material.cards ? (
          <FlashcardViewer cards={material.cards} />
        ) : (
          <PdfDocumentViewer 
            material={material} 
            onAskSage={() => onAskSage(material)} 
            onSaveNote={handleSaveToPersonalNotes} 
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(prev => !prev)}
          />
        )}

        {material.fileUrl && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '14px 18px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(99, 102, 241, 0.08))',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ fontSize: '0.84rem', color: '#cbd5e1', fontWeight: 600 }}>
              Attached File: <strong style={{ color: '#ffffff' }}>{material.fileName || material.title}</strong>
              {material.fileSize ? ` (${(material.fileSize / (1024 * 1024)).toFixed(1)} MB)` : ''}
            </span>
            <a
              href={getFileUrl(material.fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(2, 132, 199, 0.45)'
              }}
            >
              <Download size={15} /> Download / Open Original
            </a>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onAskSage(material)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: 700,
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 0 12px rgba(6, 182, 212, 0.25)'
              }}
            >
              <Sparkles size={15} style={{ color: '#38bdf8' }} /> Ask Sage AI
            </button>

            <button
              onClick={handleSaveToPersonalNotes}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: 700,
                background: savedToNotes ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                border: savedToNotes ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.15)',
                color: savedToNotes ? '#34d399' : '#f1f5f9',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {savedToNotes ? <Check size={15} /> : <FileText size={15} />}
              {savedToNotes ? 'Saved to Notes!' : '+ Save to Personal Notes'}
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '9px 20px',
              borderRadius: '12px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialViewer;
