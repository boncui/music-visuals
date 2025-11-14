# 3D Model Setup Instructions

To use the 3D Model visualizer, you need to add a 3D model file to the public directory.

## Required File:
- **Path**: `/public/landing/model.glb`
- **Format**: GLB (Binary glTF)
- **Size**: Keep under 5MB for optimal performance

## How to Add Your Model:

1. **Create or download a 3D model** in GLB format
2. **Place the file** at: `frontend/public/landing/model.glb`
3. **Restart the development server** if it's running

## Alternative Models:
If you don't have a model.glb file, you can:
- Use any GLB file and rename it to `model.glb`
- Download free models from sites like Sketchfab or Poly Haven
- Create a simple model in Blender and export as GLB

## Fallback:
If no model is found, the visualizer will show an error. The component will gracefully handle missing models.

## Model Requirements:
- **Format**: GLB (Binary glTF)
- **Size**: Under 5MB recommended
- **Materials**: Will be automatically replaced with audio-reactive materials
- **Scale**: Will be automatically scaled to fit the scene

The 3D model will react to audio with:
- Rotation speed based on volume
- Scaling on beats
- Color changes based on frequency
- Emissive glow based on audio intensity
- Floating particles around the model
