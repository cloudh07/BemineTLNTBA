import React, { createContext, useCallback, useContext, useRef } from 'react';
import { SOUND_SOURCES } from '@/constants';
import { SoundContextType, SoundSourceKey } from '@/types';

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const DEFAULT_VOLUME = .7;

export const SoundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const volumeRef = useRef(DEFAULT_VOLUME);
  const pendingKeyRef = useRef<SoundSourceKey | null>(null);
  const unlockListenersBoundRef = useRef(false);

  const playByKey = useCallback((key: SoundSourceKey) => {
    const fileBase = SOUND_SOURCES[key];
    const url = `/sounds/${fileBase}.ogg`;
    const el = new Audio(url);
    el.volume = volumeRef.current;
    return el.play();
  }, []);

  const detachUnlockListeners = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.removeEventListener('pointerdown', handleFirstGesture, true);
    window.removeEventListener('keydown', handleFirstGesture, true);
    window.removeEventListener('touchstart', handleFirstGesture, true);
    unlockListenersBoundRef.current = false;
  }, []);

  const handleFirstGesture = useCallback(() => {
    detachUnlockListeners();
    const pending = pendingKeyRef.current;
    pendingKeyRef.current = null;
    if (!pending) return;
    void playByKey(pending).catch((err) => {
      console.error(`[Sound] replay "${pending}" after unlock failed:`, err);
    });
  }, [detachUnlockListeners, playByKey]);

  const bindUnlockListeners = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (unlockListenersBoundRef.current) return;
    unlockListenersBoundRef.current = true;
    window.addEventListener('pointerdown', handleFirstGesture, {
      capture: true,
      once: true,
    });
    window.addEventListener('keydown', handleFirstGesture, {
      capture: true,
      once: true,
    });
    window.addEventListener('touchstart', handleFirstGesture, {
      capture: true,
      once: true,
    });
  }, [handleFirstGesture]);

  const playSound = useCallback((key: SoundSourceKey) => {
    void playByKey(key).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('NotAllowedError')) {
        pendingKeyRef.current = key;
        bindUnlockListeners();
        return;
      }
      const fileBase = SOUND_SOURCES[key];
      const url = `/sounds/${fileBase}.ogg`;
      console.error(`[Sound] play "${key}" (${url}):`, err);
    });
  }, [bindUnlockListeners, playByKey]);

  const setVolume = useCallback((volume: number) => {
    const n = Number(volume);
    if (Number.isNaN(n) || !Number.isFinite(n)) {
      console.warn('[Sound] invalid volume:', volume);
      return;
    }
    const v = Math.min(Math.max(n, 0), 1);
    volumeRef.current = v;
  }, []);

  return (
    <SoundContext.Provider
      value={{
        playSound,
        setVolume,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
