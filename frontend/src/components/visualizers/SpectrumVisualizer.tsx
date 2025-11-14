'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface SpectrumVisualizerProps {
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

export default function SpectrumVisualizer({ audioData, isPlaying }: SpectrumVisualizerProps) {
  const barsRef = useRef<Mesh[]>([]);
  const targetHeights = useRef<number[]>([]);
  const currentHeights = useRef<number[]>([]);

  // Generate frequency bars
  const bars = useMemo(() => {
    const barCount = 64;
    return Array.from({ length: barCount }, (_, i) => {
      const x = (i / barCount) * 12 - 6;
      return { position: [x, 0, 0] as [number, number, number], index: i };
    });
  }, []);

  useMemo(() => {
    targetHeights.current = new Array(bars.length).fill(0);
    currentHeights.current = new Array(bars.length).fill(0);
  }, [bars.length]);

  useFrame((state) => {
    if (!isPlaying) return;

    const time = state.clock.elapsedTime;
    const smoothingFactor = 0.25; // Faster response for more reactive bars

    barsRef.current.forEach((bar, index) => {
      if (!bar) return;

      // Calculate target height based on frequency data
      let targetHeight = 0;
      
      if (audioData.frequencyData && audioData.frequencyData.length > 0) {
        // Map bar index to frequency data index
        const freqIndex = Math.floor((index / bars.length) * audioData.frequencyData.length);
        const rawFreq = audioData.frequencyData[freqIndex] || 0;
        
        // Normalize and amplify the frequency data
        targetHeight = (rawFreq / 255) * 4; // Scale to reasonable height
        
        // Add frequency-specific amplification
        if (index < bars.length * 0.2) {
          // Bass range - amplify bass frequencies
          targetHeight *= audioData.bass * 2;
        } else if (index < bars.length * 0.6) {
          // Mid range - amplify mid frequencies
          targetHeight *= audioData.mid * 1.5;
        } else {
          // Treble range - amplify treble frequencies
          targetHeight *= audioData.treble * 1.8;
        }
      } else {
        // Fallback to basic audio data
        if (index < bars.length * 0.2) {
          targetHeight = audioData.bass * 3;
        } else if (index < bars.length * 0.6) {
          targetHeight = audioData.mid * 2.5;
        } else {
          targetHeight = audioData.treble * 2;
        }
      }

      // Pure audio-driven height - no artificial movement
      
      // Beat reaction - height increase
      if (audioData.beat) {
        targetHeight *= 1.8;
      }

      // Volume-based scaling
      targetHeight *= (0.5 + audioData.volume * 0.5);

      // Smooth interpolation to target height
      targetHeights.current[index] = targetHeight;
      currentHeights.current[index] += (targetHeights.current[index] - currentHeights.current[index]) * smoothingFactor;

      const finalHeight = Math.max(0.05, currentHeights.current[index]);
      
      // Update bar scale and position
      bar.scale.y = finalHeight;
      bar.position.y = finalHeight / 2; // Position bar so it grows from bottom
      
      // Static colors based on frequency range only
      const material = bar.material as any;
      
      if (index < bars.length * 0.2) {
        // Bass - Red
        material.color.setRGB(1, 0.2, 0.2);
        material.emissive.setRGB(0.2, 0, 0);
      } else if (index < bars.length * 0.6) {
        // Mid - Yellow
        material.color.setRGB(1, 1, 0.2);
        material.emissive.setRGB(0.2, 0.2, 0);
      } else {
        // Treble - Cyan
        material.color.setRGB(0.2, 1, 1);
        material.emissive.setRGB(0, 0.2, 0.2);
      }
      
      // Static emissive intensity
      material.emissiveIntensity = 0.2;
    });
  });

  return (
    <group>
      {/* Frequency bars */}
      {bars.map((bar, index) => (
        <mesh
          key={index}
          ref={(el) => {
            if (el) barsRef.current[index] = el;
          }}
          position={bar.position}
          scale={[0.08, 0.05, 0.08]} // Thinner bars for cleaner look
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={index < bars.length * 0.2 ? '#ff3333' : index < bars.length * 0.6 ? '#ffff33' : '#33ffff'}
            emissive={index < bars.length * 0.2 ? '#330000' : index < bars.length * 0.6 ? '#333300' : '#003333'}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
      
      {/* Background grid */}
      <gridHelper args={[12, 20, '#333333', '#333333']} position={[0, 0, -0.5]} />
      
      {/* Base platform */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 2]} />
        <meshBasicMaterial color="#111111" transparent opacity={0.3} />
      </mesh>
      
      {/* Central axis line */}
      <mesh position={[0, 0, -0.3]}>
        <boxGeometry args={[12, 0.02, 0.02]} />
        <meshBasicMaterial color="#444444" />
      </mesh>
    </group>
  );
}