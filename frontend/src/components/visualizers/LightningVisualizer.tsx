'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute } from 'three';

interface LightningVisualizerProps {
  audioData: {
    bass: number;
    mid: number;
    treble: number;
    volume: number;
    beat: boolean;
  };
  isPlaying: boolean;
}

export default function LightningVisualizer({ audioData, isPlaying }: LightningVisualizerProps) {
  const lightningRef = useRef<BufferGeometry>(null);
  const boltsRef = useRef<BufferGeometry[]>([]);

  useFrame((state) => {
    if (!isPlaying || !lightningRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = lightningRef.current.attributes.position.array as Float32Array;

    // Generate lightning bolt
    for (let i = 0; i < positions.length / 3; i++) {
      const x = (i / (positions.length / 3)) * 6 - 3;
      const y = Math.sin(x * 3 + time * 5) * audioData.volume * 3 +
                Math.sin(x * 7 + time * 8) * audioData.mid * 2 +
                Math.sin(x * 15 + time * 12) * audioData.treble * 1.5;
      
      // Add jagged lightning effect
      const jaggedness = Math.sin(time * 20 + i * 0.5) * 0.3;
      
      positions[i * 3] = x + jaggedness;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(time * 3 + i * 0.1) * 0.5;

      // Beat reaction - lightning intensifies
      if (audioData.beat) {
        positions[i * 3 + 1] *= 2;
        positions[i * 3] += Math.sin(time * 50) * 0.5;
      }
    }

    lightningRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* Main lightning bolt */}
      <line>
        <bufferGeometry ref={lightningRef}>
          <bufferAttribute
            attach="attributes-position"
            count={100}
            array={new Float32Array(100 * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00ffff" linewidth={2} />
      </line>

      {/* Electric particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={50}
            array={new Float32Array(50 * 3).map((_, i) => {
              if (i % 3 === 0) return (Math.random() - 0.5) * 6; // x
              if (i % 3 === 1) return (Math.random() - 0.5) * 4; // y
              return (Math.random() - 0.5) * 2; // z
            })}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#ffffff" 
          size={0.1} 
          transparent 
          opacity={0.8}
        />
      </points>

      {/* Electric field */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial 
          color="#0088ff"
          emissive="#0088ff"
          emissiveIntensity={audioData.volume * 0.3}
          transparent
          opacity={0.1}
          wireframe={true}
        />
      </mesh>

      {/* Ground plane */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshBasicMaterial 
          color="#000033" 
          transparent 
          opacity={0.3} 
        />
      </mesh>
    </group>
  );
}
