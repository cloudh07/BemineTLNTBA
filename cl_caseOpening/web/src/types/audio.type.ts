import { SOUND_SOURCES } from "@/constants";

export type SoundSourceKey = keyof typeof SOUND_SOURCES;

export interface SoundContextType {
  playSound: (key: SoundSourceKey) => void;
  setVolume: (volume: number) => void;
}