import React, { useMemo } from 'react';

/**
 * BackgroundParticles - High-Performance GPU Composited Ambient Particles
 * 
 * Replaces CPU-intensive canvas requestAnimationFrame loop with hardware-accelerated
 * CSS floating particles, eliminating 100% of backdrop-filter compositor recalculations.
 */
export const BackgroundParticles = () => {
  const particles = useMemo(() => {
    return [
      { id: 1, left: '8%', top: '15%', size: '3px', duration: '18s', delay: '0s', opacity: 0.35, color: '#38bdf8' },
      { id: 2, left: '22%', top: '45%', size: '2px', duration: '22s', delay: '-3s', opacity: 0.25, color: '#818cf8' },
      { id: 3, left: '38%', top: '20%', size: '4px', duration: '26s', delay: '-7s', opacity: 0.2, color: '#c084fc' },
      { id: 4, left: '55%', top: '70%', size: '2.5px', duration: '20s', delay: '-2s', opacity: 0.3, color: '#38bdf8' },
      { id: 5, left: '72%', top: '30%', size: '3px', duration: '24s', delay: '-5s', opacity: 0.22, color: '#34d399' },
      { id: 6, left: '85%', top: '60%', size: '2px', duration: '19s', delay: '-9s', opacity: 0.3, color: '#818cf8' },
      { id: 7, left: '15%', top: '80%', size: '3.5px', duration: '25s', delay: '-4s', opacity: 0.25, color: '#c084fc' },
      { id: 8, left: '68%', top: '85%', size: '2px', duration: '21s', delay: '-8s', opacity: 0.2, color: '#38bdf8' },
      { id: 9, left: '92%', top: '18%', size: '3px', duration: '23s', delay: '-11s', opacity: 0.28, color: '#34d399' },
      { id: 10, left: '48%', top: '40%', size: '2px', duration: '27s', delay: '-6s', opacity: 0.18, color: '#818cf8' }
    ];
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${p.color} 0%, rgba(255, 255, 255, 0.4) 100%)`,
            boxShadow: `0 0 10px ${p.color}`,
            opacity: p.opacity,
            animation: `floatAmbient ${p.duration} ease-in-out infinite alternate`,
            animationDelay: p.delay,
            willChange: 'transform'
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundParticles;
