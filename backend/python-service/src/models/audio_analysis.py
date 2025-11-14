from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime

class AudioAnalysisRequest(BaseModel):
    file_url: HttpUrl
    analysis_type: str = "full"  # full, basic, tempo_only
    cache_result: bool = True

class AudioAnalysisResponse(BaseModel):
    bpm: float
    key: str
    energy: float
    valence: float
    danceability: float
    tempo: float
    loudness: float
    spectral_centroid: List[float]
    mfcc: List[List[float]]
    chroma: List[List[float]]
    onset_times: List[float]
    beat_times: List[float]
    segment_timbre: List[List[float]]
    segment_pitches: List[List[float]]
    duration: float
    sample_rate: int
    analysis_timestamp: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class RealtimeAudioData(BaseModel):
    timestamp: float
    frequency_data: List[float]
    time_domain_data: List[float]
    bass_level: float
    mid_level: float
    treble_level: float
    overall_volume: float
    beat_detected: bool
    energy_level: float

class BeatDetectionResult(BaseModel):
    beat_times: List[float]
    tempo: float
    confidence: float

class SpectralAnalysis(BaseModel):
    spectral_centroid: List[float]
    spectral_rolloff: List[float]
    spectral_bandwidth: List[float]
    zero_crossing_rate: List[float]

class MFCCFeatures(BaseModel):
    mfcc: List[List[float]]
    delta_mfcc: List[List[float]]
    delta2_mfcc: List[List[float]]

class ChromaFeatures(BaseModel):
    chroma: List[List[float]]
    chroma_cqt: List[List[float]]
    chroma_cens: List[List[float]]

class AudioDevice(BaseModel):
    index: int
    name: str
    channels: int
    sample_rate: float

class LiveAnalysisStatus(BaseModel):
    is_recording: bool
    sample_rate: int
    chunk_size: int
    current_device: Optional[int] = None

class AudioAnalysisConfig(BaseModel):
    sample_rate: int = 44100
    chunk_size: int = 1024
    hop_length: int = 512
    n_fft: int = 2048
    n_mfcc: int = 13
