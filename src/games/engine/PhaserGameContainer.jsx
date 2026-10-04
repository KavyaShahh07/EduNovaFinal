import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { PhaserErrorBoundary } from './PhaserErrorBoundary';

/**
 * PhaserGameContainer
 * Controlled React lifecycle bridge for Phaser 3/4.
 * Guarantees complete cleanup upon unmount:
 * - game.destroy(true, false)
 * - removes canvas and event listeners
 * - cancels pending requestAnimationFrame
 */
export const PhaserGameContainer = ({
  createScene,
  customConfig = {},
  onGameReady,
  onExit,
  className = '',
  style = {}
}) => {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    if (!containerRef.current) return;

    try {
      const containerWidth = containerRef.current.clientWidth || 800;
      const containerHeight = Math.min(600, Math.max(420, window.innerHeight * 0.65));

      const baseConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: containerWidth,
        height: containerHeight,
        transparent: true,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
          }
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        ...customConfig
      };

      if (createScene) {
        baseConfig.scene = createScene();
      }

      const game = new Phaser.Game(baseConfig);
      gameRef.current = game;

      if (onGameReady) {
        onGameReady(game);
      }
    } catch (err) {
      console.error('[Phaser Container Mount Error]', err);
      if (isMounted) {
        setInitError(err);
      }
    }

    return () => {
      isMounted = false;
      if (gameRef.current) {
        try {
          gameRef.current.destroy(true, false);
        } catch (e) {
          console.warn('[Phaser Cleanup Warning]', e);
        }
        gameRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [createScene]);

  if (initError) {
    throw initError;
  }

  return (
    <PhaserErrorBoundary onExit={onExit}>
      <div
        ref={containerRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '440px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px',
          ...style
        }}
      />
    </PhaserErrorBoundary>
  );
};

export default PhaserGameContainer;
