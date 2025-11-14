'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';

export default function MicTest() {
  const {
    audioData,
    isListening,
    micEnabled,
    error,
    isInitialized,
    toggleListening,
    audioContextState
  } = useAudioAnalyzer();

  const [isVisible, setIsVisible] = useState(false);

  // Auto-show component when there's an error or when mic is not initialized
  useEffect(() => {
    if (error || !isInitialized) {
      setIsVisible(true);
    }
  }, [error, isInitialized]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        title="Test Microphone"
      >
        <Mic className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg z-50 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Microphone Test</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center space-x-2 mb-3">
        {isListening ? (
          <Mic className="w-4 h-4 text-green-400" />
        ) : (
          <MicOff className="w-4 h-4 text-red-400" />
        )}
        <span className="text-sm text-gray-300">
          {isListening ? 'Listening' : 'Not Listening'}
        </span>
        <span className="text-xs text-gray-500">
          ({micEnabled ? 'Enabled' : 'Disabled'})
        </span>
      </div>

      {/* Debug Info */}
      <div className="text-xs text-gray-500 mb-2">
        <div>Initialized: {isInitialized ? 'Yes' : 'No'}</div>
        <div>Audio Context: {audioContextState}</div>
        <div>Raw Volume: {audioData.volume.toFixed(3)}</div>
        <div>Raw Bass: {audioData.bass.toFixed(3)}</div>
        <div>Raw Mid: {audioData.mid.toFixed(3)}</div>
        <div>Raw Treble: {audioData.treble.toFixed(3)}</div>
        <div>Beat: {audioData.beat ? 'Yes' : 'No'}</div>
        <div>Freq Data Length: {audioData.frequencyData.length}</div>
        <div>Time Data Length: {audioData.timeDomainData.length}</div>
      </div>

      {/* Audio Levels */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-gray-400 w-12">Volume:</span>
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-400 h-2 rounded-full transition-all duration-100"
              style={{ width: `${audioData.volume * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-8">
            {Math.round(audioData.volume * 100)}%
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-sm" />
          <span className="text-xs text-gray-400 w-12">Bass:</span>
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${audioData.bass * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-8">
            {Math.round(audioData.bass * 100)}%
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-sm" />
          <span className="text-xs text-gray-400 w-12">Mid:</span>
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${audioData.mid * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-8">
            {Math.round(audioData.mid * 100)}%
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm" />
          <span className="text-xs text-gray-400 w-12">Treble:</span>
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${audioData.treble * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-8">
            {Math.round(audioData.treble * 100)}%
          </span>
        </div>
      </div>

      {/* Beat Detection */}
      <div className="flex items-center space-x-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${audioData.beat ? 'bg-pink-500 animate-pulse' : 'bg-gray-600'}`} />
        <span className="text-xs text-gray-400">
          Beat: {audioData.beat ? 'Detected' : 'None'}
        </span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded p-2 mb-3">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex space-x-2">
        <button
          onClick={toggleListening}
          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 inline mr-1" />
              Stop
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 inline mr-1" />
              Start
            </>
          )}
        </button>
        
        {/* Test Button */}
        <button
          onClick={() => {
            // console.log('=== MIC TEST DEBUG INFO ===');
            // console.log('Current audio data:', audioData);
            // console.log('Is listening:', isListening);
            // console.log('Mic enabled:', micEnabled);
            // console.log('Is initialized:', isInitialized);
            // console.log('Error:', error);
            // console.log('Audio context state:', audioContextState);
            // console.log('================================');
            
            // Test microphone access
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                  // console.log('Microphone access test successful:', stream);
                  stream.getTracks().forEach(track => track.stop());
                })
                .catch(err => {
                  // console.error('Microphone access test failed:', err);
                });
            } else {
              // console.error('getUserMedia not supported');
            }
          }}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          title="Log debug info to console"
        >
          Debug
        </button>
      </div>

      {/* Instructions */}
      {!isInitialized && (
        <div className="mt-3 p-2 bg-blue-500/20 border border-blue-500/50 rounded">
          <p className="text-blue-400 text-xs">
            Click "Start" to enable microphone access and begin testing.
          </p>
        </div>
      )}

      {/* Audio Test Instructions */}
      {isListening && (
        <div className="mt-3 p-2 bg-green-500/20 border border-green-500/50 rounded">
          <p className="text-green-400 text-xs">
            🎵 Play music or make sounds near your microphone to see the visualizer react!
          </p>
          <p className="text-green-400 text-xs mt-1">
            Try clapping, speaking, or playing music to test the audio detection.
          </p>
        </div>
      )}
    </div>
  );
}
