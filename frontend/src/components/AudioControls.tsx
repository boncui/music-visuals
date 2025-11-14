'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  audioData: {
    bass: number;
    mid: number;
    treble: number;
    volume: number;
    beat: boolean;
  };
  isListening: boolean;
  micEnabled: boolean;
  onToggleMic: () => void;
  error: string | null;
}

export default function AudioControls({ 
  isPlaying, 
  onTogglePlay, 
  audioData, 
  isListening, 
  micEnabled, 
  onToggleMic, 
  error 
}: AudioControlsProps) {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="flex items-center space-x-4">
      {/* Play/Pause Button */}
      <motion.button
        onClick={onTogglePlay}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
          isPlaying 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white ml-1" />
        )}
      </motion.button>

      {/* Volume Control */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-gray-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ width: `${audioData.volume * 100}%` }}
            animate={{ width: `${audioData.volume * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Microphone Toggle */}
      <button
        onClick={onToggleMic}
        className={`p-2 rounded-lg transition-colors ${
          micEnabled 
            ? 'bg-green-500/20 text-green-400' 
            : 'hover:bg-gray-800 text-gray-400'
        }`}
        title={error || (micEnabled ? 'Disable microphone' : 'Enable microphone')}
      >
        {micEnabled ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </button>

      {/* Audio Level Indicators */}
      <div className="flex items-center space-x-1">
        <div className="flex flex-col space-y-1">
          <div className="w-1 h-3 bg-red-500 rounded-full opacity-60"></div>
          <div className="w-1 h-3 bg-yellow-500 rounded-full opacity-60"></div>
          <div className="w-1 h-3 bg-green-500 rounded-full opacity-60"></div>
        </div>
        
        <div className="flex flex-col space-y-1">
          <motion.div
            className="w-1 h-3 bg-red-500 rounded-full"
            animate={{ 
              height: `${Math.max(4, audioData.bass * 12)}px`,
              opacity: audioData.bass > 0.1 ? 1 : 0.3
            }}
            transition={{ duration: 0.1 }}
          />
          <motion.div
            className="w-1 h-3 bg-yellow-500 rounded-full"
            animate={{ 
              height: `${Math.max(4, audioData.mid * 12)}px`,
              opacity: audioData.mid > 0.1 ? 1 : 0.3
            }}
            transition={{ duration: 0.1 }}
          />
          <motion.div
            className="w-1 h-3 bg-green-500 rounded-full"
            animate={{ 
              height: `${Math.max(4, audioData.treble * 12)}px`,
              opacity: audioData.treble > 0.1 ? 1 : 0.3
            }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </div>
  );
}
