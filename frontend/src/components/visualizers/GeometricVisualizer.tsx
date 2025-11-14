'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D } from 'three';

interface GeometricVisualizerProps {
  audioData: {
    bass: number;
    mid: number;
    treble: number;
    volume: number;
    beat: boolean;
  };
  isPlaying: boolean;
}

export default function GeometricVisualizer({ audioData, isPlaying }: GeometricVisualizerProps) {
  const instancedMeshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);

  const shapeCount = 50;

  useFrame((state) => {
    if (!isPlaying || !instancedMeshRef.current) return;

    const time = state.clock.elapsedTime;
    const mesh = instancedMeshRef.current;

    for (let i = 0; i < shapeCount; i++) {
      // Create geometric patterns
      const angle = (i / shapeCount) * Math.PI * 2;
      const radius = 1.5 + audioData.volume * 1.5;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = Math.sin(time * 2 + i * 0.1) * audioData.mid;

      tempObject.position.set(x, y, z);

      // Scale based on frequency
      let scale = 0.2;
      if (i % 4 === 0) scale *= audioData.bass * 2;
      else if (i % 4 === 1) scale *= audioData.mid * 1.5;
      else if (i % 4 === 2) scale *= audioData.treble * 1.8;
      else scale *= audioData.volume * 1.2;

      tempObject.scale.setScalar(Math.max(0.1, scale));
      
      // Rotation
      tempObject.rotation.set(
        time * 0.5 + i * 0.2,
        time * 0.3 + i * 0.1,
        time * 0.7 + i * 0.05
      );

      tempObject.updateMatrix();
      mesh.setMatrixAt(i, tempObject.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, shapeCount]}>
        <octahedronGeometry args={[0.3]} />
        <meshStandardMaterial 
          color="#ff6b6b"
          emissive="#ff0000"
          emissiveIntensity={0.2}
          wireframe={true}
        />
      </instancedMesh>

      {/* Central hexagon */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[1, 1, 0.1, 6]} />
        <meshStandardMaterial 
          color="#00ffff"
          emissive="#0088ff"
          emissiveIntensity={audioData.volume * 0.3}
        />
      </mesh>

      {/* Rotating rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.1, 8, 100]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffaa00"
          emissiveIntensity={audioData.mid * 0.4}
        />
      </mesh>
    </group>
  );
}
