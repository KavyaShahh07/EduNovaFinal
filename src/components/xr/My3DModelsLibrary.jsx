import React from 'react';
import {
  Box,
  Trash2,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Plus,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getFileUrl } from '../../lib/apiClient';

/**
 * My3DModelsLibrary Component
 * Renders grid card view of the authenticated user's generated persistent 3D assets.
 * Uses explicit inline styling to guarantee high contrast, pixel-perfect glassmorphism, and theme support.
 */
export default function My3DModelsLibrary({
  assets = [],
  isLoading = false,
  selectedAssetId = null,
  onSelectAsset,
  onOpenCreateModal,
  onDeleteAsset,
  onRegenerateAsset
}) {
  const { theme } = useTheme() || {};
  const isLight = theme === 'light';

  if (isLoading) {
    return (
      <div
        style={{
          padding: '32px',
          borderRadius: '20px',
          background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.65)',
          border: isLight ? '1px solid rgba(200, 218, 240, 0.8)' : '1px solid rgba(56, 189, 248, 0.2)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <Loader2 size={32} style={{ color: '#06b6d4' }} className="animate-spin" />
        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: isLight ? '#334155' : '#cbd5e1', marginTop: '12px' }}>
          Loading your 3D Asset Library...
        </p>
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div
        style={{
          padding: '40px 24px',
          borderRadius: '24px',
          background: isLight
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(235, 244, 255, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(10, 16, 32, 0.85) 100%)',
          border: isLight ? '1px solid rgba(200, 220, 245, 0.9)' : '1px solid rgba(56, 189, 248, 0.25)',
          backdropFilter: 'blur(20px)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isLight ? '0 12px 30px rgba(64, 100, 160, 0.08)' : '0 15px 35px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#06b6d4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <Box size={30} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff', margin: '0 0 6px 0' }}>
          No 3D learning objects yet
        </h3>
        <p style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : '#94a3b8', maxWidth: '420px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
          Upload any 2D textbook image, photo, or diagram to generate a real interactive 3D model with 360° view & AR.
        </p>
        <button
          onClick={onOpenCreateModal}
          style={{
            padding: '12px 22px',
            borderRadius: '14px',
            fontWeight: 700,
            fontSize: '0.85rem',
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(6, 182, 212, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} />
          <span>Upload Image to Create 3D Object</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: '#06b6d4' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
            My Generated 3D Models
          </h3>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.8)',
              color: isLight ? '#64748b' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'monospace'
            }}
          >
            {assets.length}
          </span>
        </div>
        <button
          onClick={onOpenCreateModal}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: 700,
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#06b6d4',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={14} />
          <span>New 3D Model</span>
        </button>
      </div>

      {/* Grid of 3D Assets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px'
        }}
      >
        {assets.map((asset) => {
          const isSelected = selectedAssetId === asset.id;
          const status = asset.status || 'COMPLETED';

          return (
            <div
              key={asset.id}
              style={{
                position: 'relative',
                borderRadius: '18px',
                background: isLight
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'rgba(15, 23, 42, 0.8)',
                border: isSelected
                  ? '1.5px solid #06b6d4'
                  : (isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.1)'),
                boxShadow: isSelected
                  ? '0 8px 25px rgba(6, 182, 212, 0.25)'
                  : (isLight ? '0 8px 20px rgba(64, 100, 160, 0.06)' : 'none'),
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '10px',
                      background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                      color: '#06b6d4',
                      flexShrink: 0
                    }}
                  >
                    <Box size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: isLight ? '#0f172a' : '#ffffff',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={asset.title}
                    >
                      {asset.title}
                    </h4>
                    <p style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', margin: 0 }}>
                      {asset.subject?.name || 'General Science'}
                    </p>
                  </div>
                </div>

                <StatusBadge status={status} />
              </div>

              {/* Thumbnail Preview Box */}
              <div
                onClick={() => status === 'COMPLETED' && onSelectAsset(asset)}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '130px',
                  borderRadius: '12px',
                  background: '#000000',
                  border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  cursor: status === 'COMPLETED' ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AssetThumbnail asset={asset} status={status} isLight={isLight} />

                {status === 'COMPLETED' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(2, 6, 23, 0.65)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                  >
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        background: '#06b6d4',
                        color: '#0f172a',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
                      }}
                    >
                      <Eye size={14} /> 360° Orbit
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  fontSize: '0.72rem',
                  paddingTop: '8px',
                  borderTop: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <span style={{ color: isLight ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {new Date(asset.createdAt).toLocaleDateString()}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {status === 'COMPLETED' && (
                    <button
                      onClick={() => onSelectAsset(asset)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(6, 182, 212, 0.15)',
                        color: '#06b6d4',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Open 360° & AR View"
                    >
                      <Eye size={12} />
                      <span>View</span>
                    </button>
                  )}

                  {status === 'FAILED' && onRegenerateAsset && (
                    <button
                      onClick={() => onRegenerateAsset(asset.id)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Retry generation"
                    >
                      <RefreshCw size={12} />
                      <span>Retry</span>
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteAsset(asset.id)}
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      background: 'transparent',
                      color: isLight ? '#94a3b8' : '#64748b',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title="Delete 3D Asset"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            fontSize: '0.68rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <CheckCircle2 size={12} /> Ready
        </span>
      );
    case 'PROCESSING':
    case 'TEXTURING':
      return (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '9999px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#06b6d4',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            fontSize: '0.68rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Loader2 size={12} className="animate-spin" /> Generating
        </span>
      );
    case 'QUEUED':
      return (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            fontSize: '0.68rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Clock size={12} /> Queued
        </span>
      );
    case 'FAILED':
      return (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '9999px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            fontSize: '0.68rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <AlertTriangle size={12} /> Failed
        </span>
      );
    default:
      return null;
  }
}

function AssetThumbnail({ asset, status, isLight }) {
  const [imageError, setImageError] = React.useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = React.useState(0);

  const candidateUrls = React.useMemo(() => {
    const list = [asset?.originalImageUrl, asset?.thumbnailUrl, asset?.imageUrl].filter(Boolean);
    return Array.from(new Set(list));
  }, [asset]);

  const currentRawUrl = candidateUrls[currentUrlIndex];
  const src = currentRawUrl ? getFileUrl(currentRawUrl) : null;

  const handleImageError = () => {
    if (currentUrlIndex + 1 < candidateUrls.length) {
      setCurrentUrlIndex((prev) => prev + 1);
    } else {
      setImageError(true);
    }
  };

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={asset?.title || '3D Reference Image'}
        onError={handleImageError}
        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', padding: '8px' }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#06b6d4' }}>
      <Box size={36} />
      <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: 600 }}>
        3D Object Mesh
      </span>
    </div>
  );
}
