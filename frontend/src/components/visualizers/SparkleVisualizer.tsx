'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D } from 'three';

interface SparkleVisualizerProps {
  audioData: {
    bass: number;
    mid: number;
    treble: number;
    volume: number;
    beat: boolean;
  };
  isPlaying: boolean;
}

export default function SparkleVisualizer({ audioData, isPlaying }: SparkleVisualizerProps) {
  const instancedMeshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);

  const sparkleCount = 100;

  useFrame((state) => {
    if (!isPlaying || !instancedMeshRef.current) return;

    const time = state.clock.elapsedTime;
    const mesh = instancedMeshRef.current;

    for (let i = 0; i < sparkleCount; i++) {
      // Random sparkle positions
      const x = (Math.random() - 0.5) * 8;
      const y = (Math.random() - 0.5) * 6;
      const z = (Math.random() - 0.5) * 4;

      tempObject.position.set(x, y, z);

      // Scale based on audio and randomness
      let scale = 0.05 + Math.random() * 0.1;
      if (audioData.beat) {
        scale *= 3;
      } else {
        scale *= audioData.volume * 2;
      }

      tempObject.scale.setScalar(Math.max(0.01, scale));
      
      // Twinkling rotation
      tempObject.rotation.set(
        time * 2 + i * 0.1,
        time * 1.5 + i * 0.05,
        time * 3 + i * 0.02
      );

      tempObject.updateMatrix();
      mesh.setMatrixAt(i, tempObject.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, sparkleCount]}>
        <sphereGeometry args={[0.1, 4, 4]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.8}
        />
      </instancedMesh>

      {/* Magical particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={200}
            array={new Float32Array(200 * 3).map(() => (Math.random() - 0.5) * 10)}
            itemSize={3}
            args={[new Float32Array(200 * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#ff69b4" 
          size={0.05} 
          transparent 
          opacity={0.6}
        />
      </points>

      {/* Central light source */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={audioData.volume * 0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}
