'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute } from 'three';

interface WaveformVisualizerProps {
  audioData: {
    bass: number;
    mid: number;
    treble: number;
    volume: number;
    beat: boolean;
  };
  isPlaying: boolean;
}

export default function WaveformVisualizer({ audioData, isPlaying }: WaveformVisualizerProps) {
  const waveRef = useRef<BufferGeometry>(null);
  const pointsRef = useRef<BufferGeometry>(null);

  useFrame((state) => {
    if (!isPlaying || !waveRef.current || !pointsRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = waveRef.current.attributes.position.array as Float32Array;
    const pointPositions = pointsRef.current.attributes.position.array as Float32Array;

    // Generate waveform
    for (let i = 0; i < positions.length / 3; i++) {
      const x = (i / (positions.length / 3)) * 8 - 4;
      const y = Math.sin(x * 2 + time * 2) * audioData.volume * 2 +
                Math.sin(x * 4 + time * 3) * audioData.mid * 1.5 +
                Math.sin(x * 8 + time * 4) * audioData.treble * 1;
      
      positions[i * 3 + 1] = y; // Y position
      
      // Beat reaction
      if (audioData.beat) {
        positions[i * 3 + 1] *= 1.8;
      }
    }

    // Generate floating points
    for (let i = 0; i < pointPositions.length / 3; i++) {
      const x = (i / (pointPositions.length / 3)) * 8 - 4;
      const y = Math.sin(x * 2 + time * 2) * audioData.volume * 2 +
                Math.sin(x * 4 + time * 3) * audioData.mid * 1.5 +
                Math.sin(x * 8 + time * 4) * audioData.treble * 1;
      const z = Math.sin(time * 2 + i * 0.1) * 0.5;
      
      pointPositions[i * 3] = x;
      pointPositions[i * 3 + 1] = y + 0.5;
      pointPositions[i * 3 + 2] = z;
    }

    waveRef.current.attributes.position.needsUpdate = true;
    pointsRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* Main waveform line */}
      <line>
        <bufferGeometry ref={waveRef}>
          <bufferAttribute
            attach="attributes-position"
            count={100}
            array={new Float32Array(100 * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00ffff" linewidth={3} />
      </line>

      {/* Floating points */}
      <points>
        <bufferGeometry ref={pointsRef}>
          <bufferAttribute
            attach="attributes-position"
            count={50}
            array={new Float32Array(50 * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#ff00ff" size={0.1} />
      </points>

      {/* Background grid */}
      <gridHelper args={[8, 20, '#333333', '#333333']} position={[0, 0, -1]} />
    </group>
  );
}

