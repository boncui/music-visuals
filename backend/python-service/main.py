from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
from loguru import logger

from src.services.audio_analyzer import AudioAnalyzer
from src.services.redis_client import RedisClient
from src.models.audio_analysis import AudioAnalysisRequest, AudioAnalysisResponse, RealtimeAudioData

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Music Visuals Audio Service",
    description="Python microservice for audio analysis and processing",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
audio_analyzer = AudioAnalyzer()
redis_client = RedisClient()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting Audio Analysis Service...")
    await redis_client.connect()
    logger.info("✅ Audio Analysis Service started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await redis_client.disconnect()
    logger.info("Audio Analysis Service shutdown complete")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "OK",
        "service": "audio-analysis",
        "version": "1.0.0"
    }

@app.post("/analyze", response_model=AudioAnalysisResponse)
async def analyze_audio(request: AudioAnalysisRequest):
    """Analyze audio file and return features"""
    try:
        logger.info(f"Analyzing audio file: {request.file_url}")
        
        # Download and analyze audio
        analysis_result = await audio_analyzer.analyze_file(request.file_url)
        
        # Store result in Redis for caching
        await redis_client.set_analysis_result(request.file_url, analysis_result)
        
        return AudioAnalysisResponse(**analysis_result)
        
    except Exception as e:
        logger.error(f"Error analyzing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Audio analysis failed: {str(e)}")

@app.post("/analyze-upload")
async def analyze_uploaded_file(file: UploadFile = File(...)):
    """Analyze uploaded audio file"""
    try:
        # Save uploaded file temporarily
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Analyze the file
        analysis_result = await audio_analyzer.analyze_file(temp_path)
        
        # Clean up temp file
        os.remove(temp_path)
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Error analyzing uploaded file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File analysis failed: {str(e)}")

@app.get("/analysis/{file_hash}")
async def get_analysis_result(file_hash: str):
    """Get cached analysis result"""
    try:
        result = await redis_client.get_analysis_result(file_hash)
        if not result:
            raise HTTPException(status_code=404, detail="Analysis result not found")
        return result
    except Exception as e:
        logger.error(f"Error retrieving analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analysis")

# Live audio analysis endpoints
@app.post("/live/start")
async def start_live_analysis():
    """Start live audio analysis from microphone"""
    try:
        if audio_analyzer.is_recording:
            return {"message": "Live analysis already running"}
        
        # Start live analysis
        audio_analyzer.start_live_analysis(process_realtime_audio)
        
        return {"message": "Live audio analysis started"}
        
    except Exception as e:
        logger.error(f"Error starting live analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start live analysis: {str(e)}")

@app.post("/live/stop")
async def stop_live_analysis():
    """Stop live audio analysis"""
    try:
        audio_analyzer.stop_live_analysis()
        return {"message": "Live audio analysis stopped"}
        
    except Exception as e:
        logger.error(f"Error stopping live analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to stop live analysis: {str(e)}")

@app.get("/live/status")
async def get_live_status():
    """Get live analysis status"""
    return {
        "is_recording": audio_analyzer.is_recording,
        "sample_rate": audio_analyzer.sample_rate,
        "chunk_size": audio_analyzer.chunk_size
    }

@app.get("/devices")
async def get_audio_devices():
    """Get available audio devices"""
    try:
        devices = audio_analyzer.get_available_devices()
        return {"devices": devices}
        
    except Exception as e:
        logger.error(f"Error getting audio devices: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get audio devices: {str(e)}")

@app.post("/devices/{device_index}")
async def set_audio_device(device_index: int):
    """Set audio input device"""
    try:
        audio_analyzer.set_audio_device(device_index)
        return {"message": f"Audio device set to index {device_index}"}
        
    except Exception as e:
        logger.error(f"Error setting audio device: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to set audio device: {str(e)}")

# Real-time audio data processing callback
async def process_realtime_audio(audio_data: dict):
    """Process real-time audio data and publish to Redis"""
    try:
        # Publish to Redis for real-time distribution
        await redis_client.publish_audio_data("audio:realtime", audio_data)
        
        # Store latest audio data for each user (you might want to add user_id)
        await redis_client.set_realtime_audio_data("default_user", audio_data)
        
    except Exception as e:
        logger.error(f"Error processing real-time audio: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
