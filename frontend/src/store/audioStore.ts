'use client';

import { create } from 'zustand';
import { AudioData } from '@/services/AudioAnalyzer';

interface AudioStore {
  // Audio data
  audioData: AudioData;
  
  // Audio state
  isListening: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  micEnabled: boolean;
  
  // Visualizer state
  selectedVisualizer: string;
  
  // UI state
  sidebarOpen: boolean;
  
  // Actions
  setAudioData: (data: AudioData) => void;
  setIsListening: (listening: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsMuted: (muted: boolean) => void;
  setMicEnabled: (enabled: boolean) => void;
  setSelectedVisualizer: (visualizer: string) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Reset
  resetAudioData: () => void;
}

const initialAudioData: AudioData = {
  bass: 0,
  mid: 0,
  treble: 0,
  volume: 0,
  beat: false,
  frequencyData: new Array(1024).fill(0),
  timeDomainData: new Array(1024).fill(0)
};

export const useAudioStore = create<AudioStore>((set) => ({
  // Initial state
  audioData: initialAudioData,
  isListening: false,
  isPlaying: false,
  isMuted: false,
  micEnabled: false,
  selectedVisualizer: 'spectrum',
  sidebarOpen: true,
  
  // Actions
  setAudioData: (data) => set({ audioData: data }),
  
  setIsListening: (listening) => set({ isListening: listening }),
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setIsMuted: (muted) => set({ isMuted: muted }),
  
  setMicEnabled: (enabled) => set({ micEnabled: enabled }),
  
  setSelectedVisualizer: (visualizer) => set({ selectedVisualizer: visualizer }),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  resetAudioData: () => set({ audioData: initialAudioData })
}));
