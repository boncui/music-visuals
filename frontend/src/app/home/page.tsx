'use client';

import { motion } from 'framer-motion';
import { Music, Settings, Zap, Menu, X } from 'lucide-react';
import VisualizerCanvas from '@/components/VisualizerCanvas';
import Sidebar from '@/components/Sidebar';
import AudioControls from '@/components/AudioControls';
import MicTest from '@/components/MicTest';
import { useAudioStore } from '@/store/audioStore';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';

export default function Home() {
  const {
    audioData,
    isPlaying,
    selectedVisualizer,
    sidebarOpen,
    setIsPlaying,
    setSelectedVisualizer,
    toggleSidebar
  } = useAudioStore();
  
  const {
    isListening,
    micEnabled,
    error,
    isInitialized,
    toggleListening
  } = useAudioAnalyzer();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Music Visuals
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <AudioControls 
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              audioData={audioData}
              isListening={isListening}
              micEnabled={micEnabled}
              onToggleMic={toggleListening}
              error={error}
            />
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar 
          selectedVisualizer={selectedVisualizer}
          onSelectVisualizer={setSelectedVisualizer}
          isOpen={sidebarOpen}
        />

        {/* Main Visualizer Area */}
        <main className={`flex-1 relative transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
          <div className="h-screen w-full">
            <VisualizerCanvas 
              visualizerType={selectedVisualizer}
              audioData={audioData}
              isPlaying={isPlaying}
            />
          </div>
          
          {/* Visualizer Info Overlay */}
          <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Zap className={`w-4 h-4 ${isListening ? 'text-green-400' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">
                  {isListening ? 'Live Audio' : 'Audio Off'}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-300">
                <span>Bass: {Math.round(audioData.bass * 100)}%</span>
                <span>Mid: {Math.round(audioData.mid * 100)}%</span>
                <span>Treble: {Math.round(audioData.treble * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="absolute top-20 right-6 bg-red-500/20 backdrop-blur-sm rounded-lg p-4 border border-red-500/50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-400">{error}</span>
              </div>
            </div>
          )}

          {/* Microphone Permission Prompt */}
          {!isInitialized && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 max-w-md">
                <h3 className="text-lg font-semibold mb-4">Enable Microphone</h3>
                <p className="text-gray-300 mb-4">
                  To see live audio visualizations, please allow microphone access when prompted.
                </p>
                <button
                  onClick={toggleListening}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Enable Microphone
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Microphone Test Component */}
      <MicTest />
    </div>
  );
}