import React, { useState, useEffect, useRef } from 'react';
import '@google/model-viewer';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  Smartphone,
  Eye,
  Play,
  Pause,
  AlertTriangle,
  X,
  MessageSquare,
  Layers,
  Compass
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getFileUrl } from '../../lib/apiClient';

/**
 * ModelViewer3D Component
 * Renders textured GLB 3D models using Google @google/model-viewer web component
 * with a high-performance interactive 3D Canvas fallback engine.
 * Provides 360° orbit controls, lighting, zoom, auto-rotation, educational hotspots,
 * WebXR AR trigger, and Sage AI contextual tutor integration.
 */
export default function ModelViewer3D({
  asset,
  onAskSage,
  height = '520px'
}) {
  const { theme } = useTheme() || {};
  const isLight = theme === 'light';

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [arSupported, setArSupported] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);

  // 360 Canvas Orbit Rotation State (Yaw: 0-360, Pitch: -60 to 60)
  const [yaw, setYaw] = useState(45);
  const [pitch, setPitch] = useState(20);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [simTime, setSimTime] = useState(0);

  const modelRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Uploaded Photo Image 3D Object Loader
  const [uploadedImg, setUploadedImg] = useState(null);

  useEffect(() => {
    const rawUrl = asset?.originalImageUrl || asset?.thumbnailUrl || asset?.imageUrl;
    if (!rawUrl) {
      setUploadedImg(null);
      return;
    }
    const fullUrl = getFileUrl(rawUrl);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = fullUrl;
    img.onload = () => setUploadedImg(img);
    img.onerror = () => {
      const fallbackImg = new Image();
      fallbackImg.src = fullUrl;
      fallbackImg.onload = () => setUploadedImg(fallbackImg);
      fallbackImg.onerror = () => setUploadedImg(null);
    };
  }, [asset?.originalImageUrl, asset?.thumbnailUrl, asset?.imageUrl]);

  // Format GLB source URL cleanly using apiClient's getFileUrl
  const getCleanGlbUrl = () => {
    const rawUrl = asset?.generatedModelUrl || asset?.modelPath;
    if (!rawUrl) return null;
    return getFileUrl(rawUrl);
  };

  const glbUrl = getCleanGlbUrl();
  const title = asset?.title || asset?.name || 'Interactive 3D Learning Asset';
  const metadata = asset?.metadata || {};
  const hotspots = metadata.hotspots || asset?.hotspots || [
    {
      id: 'hs-1',
      position: '0 0.2 0.3',
      x: 50,
      y: 40,
      normal: '0 1 0',
      name: 'Primary Structure',
      description: 'Main anatomical & structural core feature of this generated 3D model.',
      functionText: 'Core functional domain for scientific study.',
    },
    {
      id: 'hs-2',
      position: '0.2 -0.1 0.2',
      x: 70,
      y: 60,
      normal: '1 0 0',
      name: 'Secondary Domain',
      description: 'Secondary region responsible for structural integrity and transport.',
      functionText: 'Facilitates internal material flow and mechanical stability.',
    }
  ];

  // Register AR capability check
  useEffect(() => {
    try {
      const mv = document.createElement('model-viewer');
      if (mv && typeof mv.canActivateAR !== 'undefined') {
        setArSupported(mv.canActivateAR);
      } else {
        setArSupported(false);
      }
    } catch (e) {
      setArSupported(false);
    }
  }, []);

  // Web Component <model-viewer> event listeners & error handling
  useEffect(() => {
    const mv = modelRef.current;
    if (!mv || !glbUrl || useCanvasFallback) return;

    setIsLoaded(false);
    setLoadError(null);

    const handleLoad = () => {
      setIsLoaded(true);
      setLoadError(null);
    };

    const handleError = (e) => {
      console.warn('[ModelViewer3D] WebGL / GLB load warning, switching to interactive 3D renderer:', e);
      setLoadError('GLB model binary unavailable or pending GPU texturing. Rendering interactive 3D canvas mesh.');
      setIsLoaded(true);
      setUseCanvasFallback(true);
    };

    mv.addEventListener('load', handleLoad);
    mv.addEventListener('error', handleError);

    // Timeout safety fallback
    const safetyTimer = setTimeout(() => {
      if (!isLoaded) {
        setIsLoaded(true);
      }
    }, 3500);

    return () => {
      mv.removeEventListener('load', handleLoad);
      mv.removeEventListener('error', handleError);
      clearTimeout(safetyTimer);
    };
  }, [glbUrl, useCanvasFallback]);

  // Synchronize WebGL <model-viewer> camera orbit changes with 360° floor indicator & angle HUD
  useEffect(() => {
    const mv = modelRef.current;
    if (!mv || useCanvasFallback) return;

    const handleCameraChange = () => {
      try {
        const orbit = mv.getCameraOrbit();
        if (orbit) {
          const thetaDeg = Math.round(((orbit.theta * 180 / Math.PI) % 360 + 360) % 360);
          const phiDeg = Math.round(90 - (orbit.phi * 180 / Math.PI));
          setYaw(thetaDeg);
          setPitch(phiDeg);
        }
      } catch (e) {}
    };

    mv.addEventListener('camera-change', handleCameraChange);
    return () => {
      mv.removeEventListener('camera-change', handleCameraChange);
    };
  }, [useCanvasFallback, glbUrl]);

  // Continuous animation loop for 360 degree orbit & Canvas rendering
  useEffect(() => {
    let animId;
    let timeAcc = simTime;

    const renderLoop = () => {
      timeAcc += 0.016;
      setSimTime(Number(timeAcc.toFixed(2)));

      if (autoRotate && !isDragging) {
        setYaw(prev => (prev + 0.5) % 360);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate, isDragging]);

  // Canvas 3D Rendering Engine (Fallback / High-Performance Mode)
  useEffect(() => {
    if (!useCanvasFallback && glbUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updateDimensions = () => {
      if (canvas.parentElement) {
        const newW = canvas.parentElement.clientWidth || 600;
        const newH = canvas.parentElement.clientHeight || 450;
        if (canvas.width !== newW || canvas.height !== newH) {
          canvas.width = newW;
          canvas.height = newH;
        }
      }
    };
    updateDimensions();

    let resizeFrameId;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeFrameId) cancelAnimationFrame(resizeFrameId);
      resizeFrameId = requestAnimationFrame(() => updateDimensions());
    });
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    const width = canvas.width || 600;
    const height = canvas.height || 450;

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    const radY = (yaw * Math.PI) / 180;
    const radX = (pitch * Math.PI) / 180;

    // 1. Draw 360° Studio Stage Floor Ring & Compass Degree Hash Marks
    ctx.save();
    ctx.translate(cx, cy + 130 * zoom);
    const ringScaleY = Math.max(0.15, Math.abs(Math.cos(radX)));
    ctx.scale(zoom, zoom * 0.38 * ringScaleY);

    ctx.beginPath();
    ctx.arc(0, 0, 200, 0, Math.PI * 2);
    ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.4)' : 'rgba(6, 182, 212, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const cardinalLabels = [
      { text: '0° Front', angle: 0 },
      { text: '90° Right', angle: Math.PI / 2 },
      { text: '180° Back', angle: Math.PI },
      { text: '270° Left', angle: (3 * Math.PI) / 2 }
    ];

    cardinalLabels.forEach(cl => {
      const a = cl.angle - radY;
      const lx = Math.sin(a) * 200;
      const ly = Math.cos(a) * 200;

      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();

      ctx.fillStyle = isLight ? '#0369a1' : '#67e8f9';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(cl.text, lx - 20, ly + 18);
    });
    ctx.restore();

    // 2. Render 3D Polyhedral Object Mesh or Uploaded Photo Plate
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(zoom, zoom);

    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);
    const cosX = Math.cos(radX);

    if (uploadedImg && uploadedImg.complete && uploadedImg.naturalWidth > 0) {
      const imgAspect = uploadedImg.naturalWidth / uploadedImg.naturalHeight;
      const objW = 220;
      const objH = Math.min(260, Math.max(120, objW / imgAspect));

      const rotScaleX = Math.cos(radY);
      const absScaleX = Math.abs(rotScaleX);

      ctx.save();

      // 1. Ambient Drop Shadow on Floor under 3D Object
      ctx.save();
      ctx.translate(0, objH / 2 + 35);
      ctx.scale(absScaleX, 0.25);
      ctx.beginPath();
      ctx.arc(0, 0, objW * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();
      ctx.restore();

      // 2. Volumetric 3D Multi-Layer Extrusion (Depth Slices)
      const layersCount = 5;
      const layerDepthStep = 6;

      for (let l = layersCount - 1; l >= 0; l--) {
        const depthZ = (l - (layersCount - 1) / 2) * layerDepthStep;
        const layerScale = 1.0 - (l * 0.02);
        const layerAlpha = l === 0 ? 1.0 : Math.max(0.15, 0.85 - l * 0.18);
        const layerX = depthZ * Math.sin(radY) * (l > 0 ? 1 : 0);
        const layerY = depthZ * Math.sin(radX) * (l > 0 ? 1 : 0);

        ctx.save();
        ctx.translate(layerX, layerY);
        ctx.scale(rotScaleX * layerScale, 1.0 * layerScale);

        if (l === 0) {
          // Front Object Layer
          ctx.shadowColor = 'rgba(6, 182, 212, 0.45)';
          ctx.shadowBlur = 20;

          // Draw Uploaded Photo Image cleanly without rectangular box border
          ctx.drawImage(uploadedImg, -objW / 2, -objH / 2, objW, objH);

          // Specular Highlights Shader over object contour
          const specGrad = ctx.createLinearGradient(-objW / 2, -objH / 2, objW / 2, objH / 2);
          specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
          specGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.02)');
          specGrad.addColorStop(1, 'rgba(6, 182, 212, 0.15)');
          ctx.fillStyle = specGrad;
          ctx.fillRect(-objW / 2, -objH / 2, objW, objH);
        } else {
          // Inner Depth Layers (Creating 3D Volume & Thickness)
          ctx.globalAlpha = layerAlpha;
          ctx.drawImage(uploadedImg, -objW / 2, -objH / 2, objW, objH);
          ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.2)' : 'rgba(5, 8, 20, 0.35)';
          ctx.fillRect(-objW / 2, -objH / 2, objW, objH);
        }

        ctx.restore();
      }

      ctx.restore();

    } else {
      // 3D Polyhedron Vertices Fallback
      ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
      ctx.shadowBlur = 25;

      const rawVertices = [
        { x: 0, y: -90, z: 0 },
        { x: -70, y: -20, z: 70 },
        { x: 70, y: -20, z: 70 },
        { x: 70, y: -20, z: -70 },
        { x: -70, y: -20, z: -70 },
        { x: 0, y: 80, z: 0 }
      ];

      const transformedVerts = rawVertices.map(v => {
        const rx = v.x * cosY + v.z * sinY;
        const rz = -v.x * sinY + v.z * cosY;
        const ry = v.y * cosX - rz * Math.sin(radX);
        return { x: rx, y: ry, z: rz };
      });

      const faces = [
        { p: [0, 1, 2], color: '#06b6d4' },
        { p: [0, 2, 3], color: '#3b82f6' },
        { p: [0, 3, 4], color: '#6366f1' },
        { p: [0, 4, 1], color: '#a855f7' },
        { p: [5, 2, 1], color: '#0284c7' },
        { p: [5, 3, 2], color: '#1d4ed8' },
        { p: [5, 4, 3], color: '#4338ca' },
        { p: [5, 1, 4], color: '#7e22ce' }
      ];

      const sortedFaces = faces.map(f => {
        const avgZ = (transformedVerts[f.p[0]].z + transformedVerts[f.p[1]].z + transformedVerts[f.p[2]].z) / 3;
        return { ...f, avgZ };
      }).sort((a, b) => a.avgZ - b.avgZ);

      sortedFaces.forEach(f => {
        const p1 = transformedVerts[f.p[0]];
        const p2 = transformedVerts[f.p[1]];
        const p3 = transformedVerts[f.p[2]];

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();

        const grad = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, f.color);
        grad.addColorStop(1, '#0f172a');

        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#67e8f9';
      ctx.shadowColor = '#67e8f9';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    return () => {
      if (resizeFrameId) cancelAnimationFrame(resizeFrameId);
      resizeObserver.disconnect();
    };
  }, [yaw, pitch, zoom, simTime, useCanvasFallback, glbUrl, isLight]);

  // Pointer Interaction Handlers
  const handlePointerDown = e => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = e => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setYaw(prev => (prev + dx * 0.5 + 360) % 360);
    setPitch(prev => Math.max(-60, Math.min(60, prev - dy * 0.5)));
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleWheel = e => {
    e.preventDefault();
    setZoom(prev => Math.max(0.5, Math.min(3.0, prev - e.deltaY * 0.0015)));
  };

  const handleResetCamera = () => {
    setYaw(45);
    setPitch(20);
    setZoom(1);
    if (modelRef.current) {
      modelRef.current.cameraTarget = 'auto auto auto';
      modelRef.current.cameraOrbit = '45deg 75deg auto';
      modelRef.current.fieldOfView = 'auto';
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleTriggerAR = () => {
    if (modelRef.current && typeof modelRef.current.activateAR === 'function') {
      modelRef.current.activateAR();
    } else {
      setArSupported(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: '24px',
        overflow: 'hidden',
        background: isLight
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 246, 255, 0.92) 100%)'
          : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(5, 10, 25, 0.98) 100%)',
        border: isLight ? '1px solid rgba(200, 220, 245, 0.9)' : '1px solid rgba(56, 189, 248, 0.3)',
        boxShadow: isLight
          ? '0 20px 50px rgba(64, 100, 160, 0.12)'
          : '0 25px 60px rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: height,
        boxSizing: 'border-box'
      }}
    >
      {/* Header Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: isLight ? 'rgba(248, 250, 252, 0.95)' : 'rgba(5, 10, 25, 0.85)',
          borderBottom: isLight ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 20,
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#06b6d4',
              boxShadow: '0 0 10px #06b6d4',
              flexShrink: 0
            }}
          />
          <h3
            style={{
              fontSize: '0.92rem',
              fontWeight: 800,
              color: isLight ? '#0f172a' : '#ffffff',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '260px'
            }}
            title={title}
          >
            {title}
          </h3>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#06b6d4',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              flexShrink: 0
            }}
          >
            {useCanvasFallback || !glbUrl ? '360° Studio Mesh' : '360° Interactive GLB'}
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Renderer Toggle Mode */}
          {glbUrl && (
            <button
              onClick={() => setUseCanvasFallback(!useCanvasFallback)}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: useCanvasFallback ? 'rgba(56, 189, 248, 0.2)' : (isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.8)'),
                color: useCanvasFallback ? '#38bdf8' : (isLight ? '#64748b' : '#94a3b8'),
                border: useCanvasFallback ? '1px solid rgba(56, 189, 248, 0.4)' : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)'),
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Switch between WebGL GLB and 360° Canvas Studio"
            >
              <Layers size={14} />
              <span>{useCanvasFallback ? 'WebGL GLB' : '360° Studio'}</span>
            </button>
          )}

          {/* Hotspots Toggle */}
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            style={{
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: showHotspots ? 'rgba(168, 85, 247, 0.2)' : (isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.8)'),
              color: showHotspots ? '#c084fc' : (isLight ? '#64748b' : '#94a3b8'),
              border: showHotspots ? '1px solid rgba(168, 85, 247, 0.4)' : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)'),
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Toggle Educational Hotspots"
          >
            <Sparkles size={14} />
            <span>Hotspots</span>
          </button>

          {/* Auto Rotation Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            style={{
              padding: '6px 10px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: autoRotate ? 'rgba(6, 182, 212, 0.2)' : (isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.8)'),
              color: autoRotate ? '#06b6d4' : (isLight ? '#64748b' : '#94a3b8'),
              border: autoRotate ? '1px solid rgba(6, 182, 212, 0.4)' : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)'),
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={autoRotate ? 'Pause 360° Auto-Rotate' : 'Enable 360° Auto-Rotate'}
          >
            {autoRotate ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            style={{
              padding: '6px',
              borderRadius: '10px',
              background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.8)',
              color: isLight ? '#64748b' : '#cbd5e1',
              border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Reset 360° Camera View"
          >
            <RotateCcw size={14} />
          </button>

          {/* AR Button */}
          <button
            onClick={handleTriggerAR}
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)'
            }}
            title="Launch WebXR / AR Mode"
          >
            <Smartphone size={14} />
            <span>AR View</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            style={{
              padding: '6px',
              borderRadius: '10px',
              background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.8)',
              color: isLight ? '#64748b' : '#cbd5e1',
              border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          background: isLight ? 'radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)' : 'radial-gradient(circle, #0f172a 0%, #020617 100%)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {/* Loading Spinner */}
        {!isLoaded && !loadError && glbUrl && !useCanvasFallback && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(2, 6, 23, 0.85)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '4px solid rgba(6, 182, 212, 0.2)',
                borderTopColor: '#06b6d4',
                animation: 'spin 1s linear infinite',
                marginBottom: '12px'
              }}
            />
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
              Loading 3D Model Asset...
            </p>
            <p style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
              Initializing WebGL 360° Orbit Shader
            </p>
          </div>
        )}

        {/* RENDERER A: Google @google/model-viewer Web Component */}
        {glbUrl && !useCanvasFallback ? (
          <model-viewer
            ref={modelRef}
            src={glbUrl}
            alt={title}
            camera-controls
            touch-action="pan-y"
            interaction-prompt="auto"
            shadow-intensity="1.5"
            shadow-softness="0.5"
            exposure="1.2"
            environment-image="neutral"
            camera-orbit="45deg 75deg auto"
            bounds="tight"
            field-of-view="auto"
            auto-rotate={autoRotate ? '' : undefined}
            auto-rotate-delay="1000"
            rotation-per-second="20deg"
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="auto"
            loading="eager"
            reveal="auto"
            style={{ width: '100%', height: '100%', minHeight: '400px' }}
          >
            {/* Hotspot Overlays on WebGL Model */}
            {showHotspots &&
              hotspots.map((hs, idx) => (
                <button
                  key={hs.id || idx}
                  slot={`hotspot-${idx}`}
                  data-position={hs.position || `${(idx - 1) * 0.2} 0.2 0.3`}
                  data-normal={hs.normal || '0 1 0'}
                  onClick={() => setSelectedHotspot(hs)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    border: '2px solid #ffffff',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.6)',
                    outline: 'none'
                  }}
                >
                  <span>{idx + 1}</span>
                </button>
              ))}

            {/* Subtle 360° Floor Orbit Ring Indicator under GLB 3D Object */}
            <div
              style={{
                position: 'absolute',
                bottom: '15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '380px',
                height: '110px',
                pointerEvents: 'none',
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="380" height="110" viewBox="0 0 380 110" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="orbitRingGradGlb" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.85" />
                  </linearGradient>
                </defs>

                {/* Ground Shadow Anchoring 3D Model */}
                <ellipse cx="190" cy="55" rx="110" ry="24" fill="rgba(0, 0, 0, 0.5)" />

                {/* Elliptical Studio Turntable Orbit Ring */}
                <ellipse cx="190" cy="55" rx="165" ry="38" fill="none" stroke="url(#orbitRingGradGlb)" strokeWidth="2" strokeDasharray="6 4" />

                {/* 360° Orbit Direction Cardinal Markers */}
                {/* 0° FRONT */}
                <g transform={`translate(${190 + Math.sin(-yaw * Math.PI / 180) * 165}, ${55 + Math.cos(-yaw * Math.PI / 180) * 38})`}>
                  <circle r="4" fill="#06b6d4" />
                  <text x="0" y="14" textAnchor="middle" fill="#06b6d4" fontSize="9.5" fontWeight="800" fontFamily="Inter, sans-serif">0° FRONT</text>
                </g>

                {/* 90° RIGHT */}
                <g transform={`translate(${190 + Math.sin((-yaw + 90) * Math.PI / 180) * 165}, ${55 + Math.cos((-yaw + 90) * Math.PI / 180) * 38})`}>
                  <circle r="4" fill="#3b82f6" />
                  <text x="0" y="14" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="700" fontFamily="Inter, sans-serif">90° RIGHT</text>
                </g>

                {/* 180° BACK */}
                <g transform={`translate(${190 + Math.sin((-yaw + 180) * Math.PI / 180) * 165}, ${55 + Math.cos((-yaw + 180) * Math.PI / 180) * 38})`}>
                  <circle r="4" fill="#a855f7" />
                  <text x="0" y="14" textAnchor="middle" fill="#c084fc" fontSize="9.5" fontWeight="700" fontFamily="Inter, sans-serif">180° BACK</text>
                </g>

                {/* 270° LEFT */}
                <g transform={`translate(${190 + Math.sin((-yaw + 270) * Math.PI / 180) * 165}, ${55 + Math.cos((-yaw + 270) * Math.PI / 180) * 38})`}>
                  <circle r="4" fill="#06b6d4" />
                  <text x="0" y="14" textAnchor="middle" fill="#67e8f9" fontSize="9.5" fontWeight="700" fontFamily="Inter, sans-serif">270° LEFT</text>
                </g>
              </svg>
            </div>
          </model-viewer>
        ) : (
          /* RENDERER B: Interactive 3D Canvas Studio Engine */
          <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

            {/* Hotspots Overlay for Canvas Mode */}
            {showHotspots &&
              hotspots.map((hs, idx) => {
                const radY = (yaw * Math.PI) / 180;
                const relX = ((hs.x || 50) - 50) * 3.2;
                const relY = ((hs.y || 40) - 50) * 3.2;
                const rotX = relX * Math.cos(radY) + 30 * Math.sin(radY);
                const projX = 50 + rotX / 3.2;

                return (
                  <button
                    key={hs.id || idx}
                    onClick={() => setSelectedHotspot(hs)}
                    style={{
                      position: 'absolute',
                      left: `${projX}%`,
                      top: `${hs.y || 40}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                      border: '2px solid #ffffff',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(6, 182, 212, 0.6)',
                      zIndex: 15
                    }}
                  >
                    <span>{idx + 1}</span>
                  </button>
                );
              })}
          </div>
        )}

        {/* Hotspot Detail Popover Card */}
        {selectedHotspot && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              width: '280px',
              padding: '16px',
              borderRadius: '16px',
              background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
              border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(6, 182, 212, 0.4)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
              zIndex: 30
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }} />
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                  {selectedHotspot.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                style={{ background: 'none', border: 'none', color: isLight ? '#94a3b8' : '#64748b', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: isLight ? '#475569' : '#cbd5e1', margin: '0 0 8px 0', lineHeight: 1.4 }}>
              {selectedHotspot.description}
            </p>
            {selectedHotspot.functionText && (
              <div
                style={{
                  fontSize: '0.7rem',
                  padding: '8px',
                  borderRadius: '8px',
                  background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                  color: isLight ? '#0369a1' : '#67e8f9',
                  border: isLight ? '1px solid #bae6fd' : '1px solid rgba(6, 182, 212, 0.2)',
                  marginBottom: '10px'
                }}
              >
                <strong>Function: </strong>
                {selectedHotspot.functionText}
              </div>
            )}
            <button
              onClick={() => {
                if (onAskSage) {
                  onAskSage(
                    `Explain the hotspot "${selectedHotspot.name}" on the 3D model of ${title} in 2-3 key bullet points.`
                  );
                }
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#06b6d4',
                color: '#0f172a',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <MessageSquare size={14} />
              <span>Ask Sage AI About This</span>
            </button>
          </div>
        )}

        {/* Device AR Support Warning Notice */}
        {!arSupported && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              padding: '6px 14px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              backdropFilter: 'blur(10px)',
              color: '#f59e0b',
              fontSize: '0.74rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}
          >
            <AlertTriangle size={14} style={{ color: '#f59e0b', shrink: 0 }} />
            <span>AR mode not native on this browser. Interactive 360° orbit enabled below.</span>
          </div>
        )}

        {/* 360° Controls Interaction Telemetry Notice Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '16px',
            zIndex: 10,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.72rem',
            color: isLight ? '#64748b' : '#94a3b8',
            background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.75)',
            padding: '4px 12px',
            borderRadius: '9999px',
            border: isLight ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#06b6d4', fontWeight: 600 }}>
            <Eye size={12} /> Yaw: {Math.round(yaw)}° Pitch: {Math.round(pitch)}°
          </span>
          <span>•</span>
          <span>Wheel / Pinch to Zoom ({zoom.toFixed(2)}x)</span>
          <span>•</span>
          <span>Click Hotspots</span>
        </div>
      </div>
    </div>
  );
}
