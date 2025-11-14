'use client';

import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Waves, 
  Circle, 
  Hexagon, 
  Sparkles, 
  Zap,
  Box,
  Music,
  Palette,
  Settings2
} from 'lucide-react';

interface SidebarProps {
  selectedVisualizer: string;
  onSelectVisualizer: (type: string) => void;
  isOpen?: boolean;
}

const visualizerTypes = [
  {
    id: 'spectrum',
    name: 'Spectrum',
    description: 'Classic frequency bars',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'waveform',
    name: 'Waveform',
    description: 'Smooth wave visualization',
    icon: Waves,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'particles',
    name: 'Particles',
    description: 'Reactive particle system',
    icon: Circle,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'geometric',
    name: 'Geometric',
    description: 'Geometric shapes & patterns',
    icon: Hexagon,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'sparkles',
    name: 'Sparkles',
    description: 'Magical sparkle effects',
    icon: Sparkles,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'lightning',
    name: 'Lightning',
    description: 'Electric bolt effects',
    icon: Zap,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: '3dmodel',
    name: '3D Model',
    description: 'Interactive 3D model',
    icon: Box,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'unknownpleasures',
    name: 'Unknown Pleasures',
    description: 'Classic oscilloscope waves',
    icon: Waves,
    color: 'from-gray-600 to-gray-800'
  }
];

export default function Sidebar({ selectedVisualizer, onSelectVisualizer, isOpen = true }: SidebarProps) {
  return (
    <motion.aside 
      initial={{ x: -300 }}
      animate={{ x: isOpen ? 0 : -300 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 h-screen overflow-y-auto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Visualizers</h2>
            <p className="text-sm text-gray-400">Choose your style</p>
          </div>
        </div>

        {/* Visualizer Grid */}
        <div className="space-y-3">
          {visualizerTypes.map((visualizer) => {
            const Icon = visualizer.icon;
            const isSelected = selectedVisualizer === visualizer.id;
            
            return (
              <motion.button
                key={visualizer.id}
                onClick={() => onSelectVisualizer(visualizer.id)}
                className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${visualizer.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-white">{visualizer.name}</h3>
                    <p className="text-sm text-gray-400">{visualizer.description}</p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Settings Section */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Settings</h3>
          
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70 transition-colors">
              <Settings2 className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-300">Visualizer Settings</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70 transition-colors">
              <Music className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-300">Audio Settings</span>
            </button>
          </div>
        </div>

        {/* Preset Info */}
        <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Current Preset</h4>
          <p className="text-xs text-gray-400">
            {visualizerTypes.find(v => v.id === selectedVisualizer)?.name} visualization
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Live Audio Active</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

