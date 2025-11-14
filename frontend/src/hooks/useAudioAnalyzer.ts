'use client';

import { useEffect, useRef, useState } from 'react';
import { AudioAnalyzer, AudioData } from '@/services/AudioAnalyzer';
import { useAudioStore } from '@/store/audioStore';

export const useAudioAnalyzer = () => {
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    audioData,
    isListening,
    micEnabled,
    setAudioData,
    setIsListening,
    setMicEnabled
  } = useAudioStore();

  useEffect(() => {
    // Check browser support first
    if (!AudioAnalyzer.isSupported()) {
      setError('Your browser does not support audio analysis. Please use a modern browser like Chrome, Firefox, or Safari.');
      return;
    }

    // Initialize audio analyzer
    audioAnalyzerRef.current = new AudioAnalyzer();
    
    // Set up callbacks
    audioAnalyzerRef.current.setOnAudioData((data: AudioData) => {
      setAudioData(data);
    });
    
    audioAnalyzerRef.current.setOnError((errorMessage: string) => {
      setError(errorMessage);
      setIsListening(false);
      setMicEnabled(false);
    });
    
    setIsInitialized(true);
    
    return () => {
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.stopListening();
      }
    };
  }, [setAudioData, setIsListening, setMicEnabled]);

  const startListening = async () => {
    if (!audioAnalyzerRef.current) {
      // console.error('Audio analyzer not initialized');
      return false;
    }
    
    try {
      // console.log('Starting listening from hook...');
      setError(null);
      const success = await audioAnalyzerRef.current.startListening();
      
      if (success) {
        // console.log('Successfully started listening');
        setIsListening(true);
        setMicEnabled(true);
      } else {
        // console.error('Failed to start listening');
        setError('Failed to start microphone');
      }
      
      return success;
    } catch (err) {
      // console.error('Error in startListening:', err);
      setError(`Failed to start listening: ${err}`);
      return false;
    }
  };

  const stopListening = () => {
    if (audioAnalyzerRef.current) {
      audioAnalyzerRef.current.stopListening();
      setIsListening(false);
      setMicEnabled(false);
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  return {
    audioData,
    isListening,
    micEnabled,
    error,
    isInitialized,
    startListening,
    stopListening,
    toggleListening,
    audioContextState: audioAnalyzerRef.current?.audioContextState || 'closed'
  };
};
