'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { OrbitControls, Environment } from '@react-three/drei';
import SpectrumVisualizer from './visualizers/SpectrumVisualizer';
import WaveformVisualizer from './visualizers/WaveformVisualizer';
import ParticleVisualizer from './visualizers/ParticleVisualizer';
import GeometricVisualizer from './visualizers/GeometricVisualizer';
import SparkleVisualizer from './visualizers/SparkleVisualizer';
import LightningVisualizer from './visualizers/LightningVisualizer';
import ThreeDModel from './visualizers/3dmodel';
import UnknownPleasures from './visualizers/unknownPleasures';

interface VisualizerCanvasProps {
  visualizerType: string;
  audioData: {
    bass: number;
    mid: number;
    treble: number;
    volume: number;
    beat: boolean;
    frequencyData: number[];
    timeDomainData: number[];
  };
  isPlaying: boolean;
}

export default function VisualizerCanvas({ visualizerType, audioData, isPlaying }: VisualizerCanvasProps) {
  const visualizerComponent = useMemo(() => {
    switch (visualizerType) {
      case 'spectrum':
        return <SpectrumVisualizer audioData={audioData} isPlaying={isPlaying} />;
      case 'waveform':
        return <WaveformVisualizer audioData={audioData} isPlaying={isPlaying} />;
      case 'particles':
        return <ParticleVisualizer audioData={audioData} isPlaying={isPlaying} />;
      case 'geometric':
        return <GeometricVisualizer audioData={audioData} isPlaying={isPlaying} />;
      case 'sparkles':
        return <SparkleVisualizer audioData={audioData} isPlaying={isPlaying} />;
      case 'lightning':
        return <LightningVisualizer audioData={audioData} isPlaying={isPlaying} />;
      default:
        return <SpectrumVisualizer audioData={audioData} isPlaying={isPlaying} />;
    }
  }, [visualizerType, audioData, isPlaying]);

  // Special handling for 3D model and Unknown Pleasures - render them outside the main Canvas
  if (visualizerType === '3dmodel') {
    return (
      <div className="w-full h-full">
        <ThreeDModel audioData={audioData} isPlaying={isPlaying} />
        
        {/* Loading Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white/50 text-sm">
            {!isPlaying && 'Press play to start visualization'}
          </div>
        </div>
      </div>
    );
  }

  if (visualizerType === 'unknownpleasures') {
    return (
      <div className="w-full h-full">
        <UnknownPleasures audioData={audioData} isPlaying={isPlaying} />
        
        {/* Loading Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white/50 text-sm">
            {!isPlaying && 'Press play to start visualization'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {/* Environment */}
          <Environment preset="night" />
          
          {/* Controls */}
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            autoRotate={isPlaying}
            autoRotateSpeed={0.5}
            // autoRotateSpeed={0.0}
          />
          
          {/* Visualizer */}
          {visualizerComponent}
        </Suspense>
      </Canvas>
      
      {/* Loading Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-white/50 text-sm">
          {!isPlaying && 'Press play to start visualization'}
        </div>
      </div>
    </div>
  );
}

