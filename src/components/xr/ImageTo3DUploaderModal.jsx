import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  X,
  Sparkles,
  Box,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  FileImage
} from 'lucide-react';
import { xr3dApi } from '../../lib/apiClient';
import { useTheme } from '../../context/ThemeContext';

/**
 * ImageTo3DUploaderModal Component
 * Facilitates uploading a 2D learning image, inputting educational metadata,
 * triggering Tencent Hunyuan3D-2.1 generation, and displaying real-time stage progress.
 * Uses explicit inline styling to guarantee high contrast, pixel-perfect glassmorphism, and theme support.
 */
export default function ImageTo3DUploaderModal({
  isOpen,
  onClose,
  onAssetCreated,
  subjects = []
}) {
  const { theme } = useTheme() || {};
  const isLight = theme === 'light';

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Job State
  const [activeAssetId, setActiveAssetId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null); // QUEUED, PROCESSING, TEXTURING, COMPLETED, FAILED
  const [jobStage, setJobStage] = useState('');
  const [jobMessage, setJobMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype || file.type)) {
      setErrorMessage('Unsupported file format. Please upload JPG, PNG, or WEBP images.');
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    if (!title) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setTitle(baseName.replace(/[^a-zA-Z0-9 ]/g, ' '));
    }
  };

  // Socket.IO realtime listener & Polling fallback
  useEffect(() => {
    if (!activeAssetId || jobStatus === 'COMPLETED' || jobStatus === 'FAILED') return;

    const handleSocketEvent = (event) => {
      const data = event.detail || event;
      if (data && data.assetId === activeAssetId) {
        setJobStatus(data.status);
        if (data.stage) setJobStage(data.stage);
        if (data.message) setJobMessage(data.message);

        if (data.status === 'COMPLETED') {
          if (onAssetCreated && data.asset) onAssetCreated(data.asset);
        } else if (data.status === 'FAILED') {
          setErrorMessage(data.error || '3D Model generation failed.');
        }
      }
    };

    window.addEventListener('xr:3d-generation-status', handleSocketEvent);

    const pollInterval = setInterval(async () => {
      try {
        const res = await xr3dApi.get3DAsset(activeAssetId);
        if (res?.success && res?.asset) {
          const asset = res.asset;
          setJobStatus(asset.status);
          setJobMessage(
            asset.status === 'QUEUED'
              ? 'Job queued in generation pipeline...'
              : asset.status === 'PROCESSING'
                ? 'Hunyuan3D-Shape-2.1 generating 3D geometry mesh...'
                : asset.status === 'TEXTURING'
                  ? 'Hunyuan3D-Paint-2.1 synthesizing PBR textures...'
                  : asset.status === 'COMPLETED'
                    ? '3D GLB Asset generation complete!'
                    : 'Generation process encountered an issue.'
          );

          if (asset.status === 'COMPLETED') {
            clearInterval(pollInterval);
            if (onAssetCreated) onAssetCreated(asset);
          } else if (asset.status === 'FAILED') {
            clearInterval(pollInterval);
            setErrorMessage(asset.errorMessage || 'Generation failed. Please try another image.');
          }
        }
      } catch (err) {
        console.warn('[3D Generation Poll Error]:', err);
      }
    }, 2500);

    return () => {
      window.removeEventListener('xr:3d-generation-status', handleSocketEvent);
      clearInterval(pollInterval);
    };
  }, [activeAssetId, jobStatus, onAssetCreated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a reference image to convert.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setJobStatus('QUEUED');
    setJobStage('uploading');
    setJobMessage('Uploading image and initializing Tencent Hunyuan3D pipeline...');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('title', title || 'Educational 3D Object');
      formData.append('description', description);
      if (subjectId) formData.append('subjectId', subjectId);
      if (topicId) formData.append('topicId', topicId);
      formData.append('generationType', 'image_to_3d');

      const response = await xr3dApi.create3DAsset(formData);

      if (response?.success && response?.asset) {
        setActiveAssetId(response.asset.id);
        setJobStatus(response.asset.status || 'QUEUED');
      } else {
        setErrorMessage(response?.error || 'Failed to submit generation request.');
        setJobStatus(null);
      }
    } catch (err) {
      console.error('[Upload3D] Error:', err);
      setErrorMessage(err.message || 'Error submitting image file.');
      setJobStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle('');
    setDescription('');
    setSubjectId('');
    setTopicId('');
    setActiveAssetId(null);
    setJobStatus(null);
    setJobStage('');
    setJobMessage('');
    setErrorMessage('');
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(2, 6, 23, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '580px',
          borderRadius: '24px',
          background: isLight
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 246, 255, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(10, 16, 32, 0.98) 100%)',
          border: isLight ? '1px solid rgba(200, 220, 245, 0.9)' : '1px solid rgba(56, 189, 248, 0.35)',
          boxShadow: isLight
            ? '0 25px 60px rgba(0, 0, 0, 0.2), 0 0 30px rgba(6, 182, 212, 0.15)'
            : '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          color: isLight ? '#0f172a' : '#f8fafc'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: isLight ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid rgba(255, 255, 255, 0.1)',
            background: isLight ? 'rgba(248, 250, 252, 0.8)' : 'rgba(5, 10, 25, 0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '10px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)'
              }}
            >
              <Box size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: isLight ? '#0f172a' : '#ffffff' }}>
                  Create 3D Learning Asset
                </h2>
                <span
                  style={{
                    padding: '2px 10px',
                    borderRadius: '9999px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: '#06b6d4',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'monospace'
                  }}
                >
                  Hunyuan3D-2.1
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', margin: '2px 0 0 0' }}>
                AI Image-to-3D mesh & PBR texture synthesis
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            style={{
              padding: '8px',
              borderRadius: '10px',
              background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.8)',
              color: isLight ? '#64748b' : '#cbd5e1',
              border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {jobStatus && jobStatus !== 'FAILED' ? (
            /* Active Progress Timeline */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', padding: '10px 0' }}>
              {jobStatus === 'COMPLETED' ? (
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1.5px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                  <CheckCircle2 size={36} />
                </div>
              ) : (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justify: 'center', width: '70px', height: '70px' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '4px solid rgba(6, 182, 212, 0.2)', borderTopColor: '#06b6d4', animation: 'spin 1s linear infinite' }} />
                  <Cpu size={28} style={{ color: '#06b6d4', position: 'absolute' }} />
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff', margin: '0 0 4px 0' }}>
                  {jobStatus === 'COMPLETED'
                    ? '3D Model Ready!'
                    : jobStatus === 'TEXTURING'
                      ? 'Synthesizing PBR Materials...'
                      : jobStatus === 'PROCESSING'
                        ? 'Reconstructing 3D Geometry...'
                        : 'Queued for AI Generation...'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#06b6d4', fontFamily: 'monospace', margin: 0 }}>
                  {jobMessage || 'Processing neural mesh extraction...'}
                </p>
              </div>

              {/* Stage Progress Timeline */}
              <div style={{ width: '100%', background: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(5, 10, 25, 0.8)', padding: '16px', borderRadius: '16px', border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <StageItem
                  title="1. Image Processing & Masking"
                  subtitle="Optimizing aspect ratio and background noise"
                  active={jobStatus === 'QUEUED'}
                  done={['PROCESSING', 'TEXTURING', 'COMPLETED'].includes(jobStatus)}
                  isLight={isLight}
                />
                <StageItem
                  title="2. Hunyuan3D-Shape-2.1 Geometry"
                  subtitle="Deep neural implicit shape field generation"
                  active={jobStatus === 'PROCESSING'}
                  done={['TEXTURING', 'COMPLETED'].includes(jobStatus)}
                  isLight={isLight}
                />
                <StageItem
                  title="3. Hunyuan3D-Paint-2.1 PBR Textures"
                  subtitle="Generating diffuse, normal, and roughness maps"
                  active={jobStatus === 'TEXTURING'}
                  done={jobStatus === 'COMPLETED'}
                  isLight={isLight}
                />
                <StageItem
                  title="4. GLB Mesh Optimization"
                  subtitle="Compiling interactive 360° & AR ready GLB file"
                  active={jobStatus === 'COMPLETED'}
                  done={jobStatus === 'COMPLETED'}
                  isLight={isLight}
                />
              </div>

              {jobStatus === 'COMPLETED' && (
                <button
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)'
                  }}
                >
                  View 3D Asset in 360° Studio
                </button>
              )}
            </div>
          ) : (
            /* Upload Form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Image Drag & Drop Box */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: isLight ? '#334155' : '#cbd5e1', marginBottom: '6px' }}>
                  Reference Image <span style={{ color: '#06b6d4' }}>*</span>
                </label>
                {!previewUrl ? (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '160px',
                      borderRadius: '16px',
                      border: isLight ? '2px dashed #94a3b8' : '2px dashed rgba(56, 189, 248, 0.4)',
                      background: isLight ? 'rgba(241, 245, 249, 0.6)' : 'rgba(5, 10, 25, 0.7)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ padding: '10px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', marginBottom: '8px' }}>
                      <UploadCloud size={24} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isLight ? '#0f172a' : '#ffffff' }}>
                      Click to upload or drag & drop image
                    </span>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                      JPG, PNG, WEBP (Max 10MB)
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                ) : (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '160px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(56, 189, 248, 0.3)',
                      background: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Upload preview"
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '6px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.85)',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: isLight ? '#334155' : '#cbd5e1', marginBottom: '6px' }}>
                  Object Title <span style={{ color: '#06b6d4' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Human Heart Anatomy, Solar Flare Model, Bohr Atom"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: isLight ? '#ffffff' : 'rgba(5, 10, 25, 0.9)',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: isLight ? '#0f172a' : '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Subject Selector */}
              {subjects.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: isLight ? '#334155' : '#cbd5e1', marginBottom: '6px' }}>
                    Related Subject (Optional)
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: isLight ? '#ffffff' : 'rgba(5, 10, 25, 0.9)',
                      border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
                      color: isLight ? '#0f172a' : '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id} style={{ background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff' }}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: isLight ? '#334155' : '#cbd5e1', marginBottom: '6px' }}>
                  Description / Context (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short educational overview for interactive hotspots..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: isLight ? '#ffffff' : 'rgba(5, 10, 25, 0.9)',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: isLight ? '#0f172a' : '#ffffff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#f87171',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={16} style={{ shrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* License Notice */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: isLight ? 'rgba(241, 245, 249, 0.7)' : 'rgba(5, 10, 25, 0.6)',
                  border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.74rem',
                  color: isLight ? '#64748b' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={14} style={{ color: '#a855f7', shrink: 0 }} />
                <span>Powered by Tencent Hunyuan3D-2.1 under Non-Commercial Educational License.</span>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', items: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.6)',
                    color: isLight ? '#64748b' : '#cbd5e1',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.1)',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedFile}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: isSubmitting || !selectedFile
                      ? (isLight ? '#cbd5e1' : '#334155')
                      : 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                    color: isSubmitting || !selectedFile ? (isLight ? '#94a3b8' : '#64748b') : '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: isSubmitting || !selectedFile ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isSubmitting || !selectedFile ? 'none' : '0 4px 20px rgba(6, 182, 212, 0.35)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generate 3D Model</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function StageItem({ title, subtitle, active, done, isLight }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
      <div
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 800,
          flexShrink: 0,
          background: done
            ? 'rgba(16, 185, 129, 0.2)'
            : active
              ? 'rgba(6, 182, 212, 0.2)'
              : (isLight ? 'rgba(226, 232, 240, 0.8)' : 'rgba(30, 41, 59, 0.6)'),
          color: done ? '#10b981' : active ? '#06b6d4' : (isLight ? '#94a3b8' : '#64748b'),
          border: done
            ? '1px solid rgba(16, 185, 129, 0.5)'
            : active
              ? '1px solid rgba(6, 182, 212, 0.6)'
              : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.1)')
        }}
      >
        {done ? '✓' : active ? '•' : ''}
      </div>
      <div>
        <div
          style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: done
              ? (isLight ? '#64748b' : '#94a3b8')
              : active
                ? '#06b6d4'
                : (isLight ? '#334155' : '#cbd5e1'),
            textDecoration: done ? 'line-through' : 'none'
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: '0.72rem', color: isLight ? '#94a3b8' : '#64748b' }}>{subtitle}</div>
      </div>
    </div>
  );
}
