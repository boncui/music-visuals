'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D } from 'three';

interface ParticleVisualizerProps {
  audioData: {
    bass: number;
    mid: number;
    treble: number;
    volume: number;
    beat: boolean;
  };
  isPlaying: boolean;
}

export default function ParticleVisualizer({ audioData, isPlaying }: ParticleVisualizerProps) {
  const instancedMeshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);

  const particleCount = 200;

  useFrame((state) => {
    if (!isPlaying || !instancedMeshRef.current) return;

    const time = state.clock.elapsedTime;
    const mesh = instancedMeshRef.current;

    for (let i = 0; i < particleCount; i++) {
      // Calculate position based on audio data
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2 + audioData.volume * 2;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius + Math.sin(time * 2 + i * 0.1) * audioData.mid;
      const z = Math.sin(time * 3 + i * 0.05) * audioData.treble * 2;

      // Beat reaction - particles explode outward
      if (audioData.beat) {
        const beatRadius = radius * 2;
        tempObject.position.set(
          Math.cos(angle) * beatRadius,
          y,
          z
        );
      } else {
        tempObject.position.set(x, y, z);
      }

      // Scale based on frequency
      let scale = 0.1;
      if (i % 3 === 0) scale *= audioData.bass * 3;
      else if (i % 3 === 1) scale *= audioData.mid * 2;
      else scale *= audioData.treble * 2;

      tempObject.scale.setScalar(Math.max(0.05, scale));
      
      // Rotation
      tempObject.rotation.set(
        time * 0.5 + i * 0.1,
        time * 0.3 + i * 0.05,
        time * 0.7 + i * 0.02
      );

      tempObject.updateMatrix();
      mesh.setMatrixAt(i, tempObject.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, particleCount]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial 
          color="#ff6b6b"
          emissive="#ff0000"
          emissiveIntensity={0.3}
        />
      </instancedMesh>

      {/* Central core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={audioData.volume * 0.5}
        />
      </mesh>
    </group>
  );
}

