"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useEffect, useRef, useState } from "react"
import { useGLTF, Environment } from "@react-three/drei"
import { Group, Mesh, MeshStandardMaterial } from "three"

interface ThreeDModelProps {
  audioData?: {
    bass: number;
    mid: number;
    treble: number;
    volume: number;
    beat: boolean;
  };
  isPlaying?: boolean;
}

function Model({ simplified = false, audioData, isPlaying }: { simplified?: boolean; audioData?: ThreeDModelProps['audioData']; isPlaying?: boolean }) {
  const { scene } = useGLTF("/model.glb")
  const modelRef = useRef<Group>(null)
  const materialRef = useRef<MeshStandardMaterial | null>(null)
  const meshRefs = useRef<Mesh[]>([])

  // Set material manually
  scene.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const material = new MeshStandardMaterial({
        roughness: .8,
        metalness: .3,
      })
      materialRef.current = material
      ;(child as Mesh).material = material
      
      // Set initial color
      material.color.setHex(0x2e8464);
    }
  })

  // Audio-reactive animations
  useFrame(() => {
    if (modelRef.current && !simplified) {
      // Base rotation - slower and gentler
      modelRef.current.rotation.y += 0.0002
      
      // Audio-reactive rotation - much gentler
      if (audioData && isPlaying) {
        // Bass affects X rotation - reduced intensity
        modelRef.current.rotation.x = Math.sin(Date.now() * 0.0001) * 0.1 + (audioData.bass * 0.15)
        // Mid affects Z rotation - reduced intensity
        modelRef.current.rotation.z = Math.cos(Date.now() * 0.00005) * 0.08 + (audioData.mid * 0.1)
        
        // Volume affects scale - much gentler scaling
        const baseScale = 2;
        const volumeScale = 1 + (audioData.volume * 0.05);
        const beatScale = audioData.beat ? 1.02 : 1;
        modelRef.current.scale.setScalar(baseScale * volumeScale * beatScale);
        
        // Beat affects position - gentler bouncing
        if (audioData.beat) {
          modelRef.current.position.y = Math.sin(Date.now() * 0.005) * 0.2;
        } else {
          modelRef.current.position.y = 0;
        }

        // Instagram gradient colors based on audio data
        if (materialRef.current) {
          // Instagram gradient colors: Purple -> Pink -> Orange -> Yellow
          const instagramColors = [
            { r: 0.64, g: 0.20, b: 0.93 }, // Purple
            { r: 0.93, g: 0.20, b: 0.64 }, // Pink
            { r: 0.93, g: 0.40, b: 0.20 }, // Orange
            { r: 0.93, g: 0.80, b: 0.20 }, // Yellow
          ];
          
          // Calculate color index based on audio intensity
          const audioIntensity = (audioData.bass + audioData.mid + audioData.treble) / 3;
          const volumeBoost = audioData.volume * 0.5;
          const totalIntensity = Math.min(1, audioIntensity + volumeBoost);
          
          // Interpolate between colors based on intensity
          const colorIndex = totalIntensity * (instagramColors.length - 1);
          const colorIndexFloor = Math.floor(colorIndex);
          const colorIndexCeil = Math.min(instagramColors.length - 1, colorIndexFloor + 1);
          const t = colorIndex - colorIndexFloor;
          
          const color1 = instagramColors[colorIndexFloor];
          const color2 = instagramColors[colorIndexCeil];
          
          // Linear interpolation between colors
          const r = color1.r + (color2.r - color1.r) * t;
          const g = color1.g + (color2.g - color1.g) * t;
          const b = color1.b + (color2.b - color1.b) * t;
          
          // Apply brightness based on volume
          const brightness = 0.6 + (audioData.volume * 0.4);
          
          materialRef.current.color.setRGB(r * brightness, g * brightness, b * brightness);
        }
      } else {
        // Default animations when no audio - gentler
        modelRef.current.rotation.x = Math.sin(Date.now() * 0.0001) * 0.1
        modelRef.current.rotation.z = Math.cos(Date.now() * 0.00005) * 0.08
        modelRef.current.scale.setScalar(simplified ? 1.5 : 2)
        modelRef.current.position.y = 0
        
        // Default color when no audio
        if (materialRef.current) {
          materialRef.current.color.setHex(0x2e8464);
        }
      }
    }
  })

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={simplified ? 1.5 : 2}
      position={[0, 0, 0]}
    />
  )
}

export default function ThreeDModel({ audioData, isPlaying }: ThreeDModelProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas
        camera={{ 
          position: [0, 0, 20], 
          fov: 60 
        }}
        gl={{ antialias: true, alpha: true }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          {/* 3D Model specific lighting */}
          <ambientLight intensity={2.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          {/* Environment */}
          <Environment preset="night" />
          
          {/* 3D Model */}
          <Model simplified={isMobile} audioData={audioData} isPlaying={isPlaying} />
        </Suspense>
      </Canvas>
    </div>
  )
}
