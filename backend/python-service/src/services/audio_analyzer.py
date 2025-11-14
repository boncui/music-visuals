import numpy as np
import librosa
import sounddevice as sd
from scipy import signal
from scipy.fft import fft, fftfreq
import asyncio
import threading
from typing import List, Dict, Any, Optional
from loguru import logger
import time

class AudioAnalyzer:
    """Real-time audio analysis using sounddevice, librosa, and scipy"""
    
    def __init__(self, sample_rate: int = 44100, chunk_size: int = 1024):
        self.sample_rate = sample_rate
        self.chunk_size = chunk_size
        self.is_recording = False
        self.audio_buffer = []
        self.stream = None
        
        # Audio analysis parameters
        self.hop_length = 512
        self.n_fft = 2048
        self.n_mfcc = 13
        
        # Beat tracking parameters
        self.tempo_history = []
        self.beat_times = []
        
        logger.info("AudioAnalyzer initialized")
    
    async def analyze_file(self, file_path: str) -> Dict[str, Any]:
        """Analyze an audio file and extract features"""
        try:
            logger.info(f"Analyzing audio file: {file_path}")
            
            # Load audio file
            y, sr = librosa.load(file_path, sr=self.sample_rate)
            
            # Extract features
            features = await self._extract_features(y, sr)
            
            logger.info("Audio analysis completed successfully")
            return features
            
        except Exception as e:
            logger.error(f"Error analyzing audio file: {str(e)}")
            raise e
    
    async def _extract_features(self, y: np.ndarray, sr: int) -> Dict[str, Any]:
        """Extract comprehensive audio features"""
        
        # Basic audio properties
        duration = len(y) / sr
        
        # Spectral features
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
        zero_crossing_rate = librosa.feature.zero_crossing_rate(y)[0]
        
        # MFCC features
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=self.n_mfcc)
        
        # Chroma features
        chroma = librosa.feature.chroma(y=y, sr=sr)
        
        # Beat and tempo analysis
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        beat_times = librosa.frames_to_time(beats, sr=sr)
        
        # Onset detection
        onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
        onset_times = librosa.frames_to_time(onset_frames, sr=sr)
        
        # Rhythm features
        rhythm_features = librosa.feature.rhythm(y=y, sr=sr)
        
        # Energy and loudness
        rms = librosa.feature.rms(y=y)[0]
        energy = np.mean(rms)
        
        # Key detection (simplified)
        chroma_mean = np.mean(chroma, axis=1)
        key = self._detect_key(chroma_mean)
        
        # Danceability and valence (simplified calculations)
        danceability = self._calculate_danceability(tempo, energy, spectral_centroid)
        valence = self._calculate_valence(chroma_mean, energy)
        
        return {
            "bpm": float(tempo),
            "key": key,
            "energy": float(energy),
            "valence": float(valence),
            "danceability": float(danceability),
            "tempo": float(tempo),
            "loudness": float(np.mean(librosa.amplitude_to_db(rms))),
            "spectral_centroid": spectral_centroid.tolist(),
            "mfcc": mfcc.tolist(),
            "chroma": chroma.tolist(),
            "onset_times": onset_times.tolist(),
            "beat_times": beat_times.tolist(),
            "segment_timbre": mfcc.tolist(),  # Using MFCC as timbre representation
            "segment_pitches": chroma.tolist(),  # Using chroma as pitch representation
            "duration": float(duration),
            "sample_rate": sr
        }
    
    def _detect_key(self, chroma_mean: np.ndarray) -> str:
        """Simple key detection based on chroma features"""
        keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        key_index = np.argmax(chroma_mean)
        return keys[key_index]
    
    def _calculate_danceability(self, tempo: float, energy: float, spectral_centroid: np.ndarray) -> float:
        """Calculate danceability based on tempo, energy, and spectral features"""
        # Normalize tempo (optimal range: 90-140 BPM)
        tempo_score = 1.0 - abs(tempo - 115) / 115
        
        # Energy score
        energy_score = min(energy * 2, 1.0)
        
        # Spectral centroid score (higher = more brightness)
        brightness_score = np.mean(spectral_centroid) / 4000
        
        # Combine scores
        danceability = (tempo_score * 0.4 + energy_score * 0.4 + brightness_score * 0.2)
        return max(0, min(1, danceability))
    
    def _calculate_valence(self, chroma_mean: np.ndarray, energy: float) -> float:
        """Calculate valence (positivity) based on chroma and energy"""
        # Major keys tend to sound more positive
        major_chroma = chroma_mean[[0, 2, 4, 5, 7, 9, 11]]  # C, D, E, F, G, A, B
        minor_chroma = chroma_mean[[0, 2, 3, 5, 7, 8, 10]]  # C, D, Eb, F, G, Ab, Bb
        
        major_score = np.mean(major_chroma)
        minor_score = np.mean(minor_chroma)
        
        # Higher energy and major key = more positive
        valence = (major_score - minor_score) * 0.5 + energy * 0.5
        return max(0, min(1, valence))
    
    def start_live_analysis(self, callback_func):
        """Start live audio analysis from microphone"""
        try:
            logger.info("Starting live audio analysis")
            
            def audio_callback(indata, frames, time, status):
                if status:
                    logger.warning(f"Audio callback status: {status}")
                
                # Convert to mono if stereo
                if indata.ndim > 1:
                    audio_data = np.mean(indata, axis=1)
                else:
                    audio_data = indata.flatten()
                
                # Process audio in real-time
                asyncio.create_task(self._process_realtime_audio(audio_data, callback_func))
            
            # Start audio stream
            self.stream = sd.InputStream(
                callback=audio_callback,
                channels=1,
                samplerate=self.sample_rate,
                blocksize=self.chunk_size,
                dtype=np.float32
            )
            
            self.stream.start()
            self.is_recording = True
            logger.info("Live audio analysis started")
            
        except Exception as e:
            logger.error(f"Error starting live analysis: {str(e)}")
            raise e
    
    def stop_live_analysis(self):
        """Stop live audio analysis"""
        try:
            if self.stream:
                self.stream.stop()
                self.stream.close()
                self.stream = None
            
            self.is_recording = False
            logger.info("Live audio analysis stopped")
            
        except Exception as e:
            logger.error(f"Error stopping live analysis: {str(e)}")
    
    async def _process_realtime_audio(self, audio_data: np.ndarray, callback_func):
        """Process real-time audio data"""
        try:
            # Compute FFT for frequency analysis
            fft_data = fft(audio_data)
            freqs = fftfreq(len(audio_data), 1/self.sample_rate)
            
            # Get magnitude spectrum
            magnitude = np.abs(fft_data[:len(fft_data)//2])
            freqs = freqs[:len(freqs)//2]
            
            # Apply smoothing filter
            smoothed_magnitude = signal.savgol_filter(magnitude, window_length=11, polyorder=3)
            
            # Calculate frequency bands
            bass_level = self._calculate_band_level(smoothed_magnitude, freqs, 20, 250)
            mid_level = self._calculate_band_level(smoothed_magnitude, freqs, 250, 4000)
            treble_level = self._calculate_band_level(smoothed_magnitude, freqs, 4000, 20000)
            
            # Overall volume
            overall_volume = np.sqrt(np.mean(audio_data**2))
            
            # Beat detection (simplified)
            beat_detected = self._detect_beat(audio_data)
            
            # Energy level
            energy_level = np.mean(np.abs(audio_data))
            
            # Create real-time data structure
            realtime_data = {
                "timestamp": time.time(),
                "frequency_data": magnitude.tolist(),
                "time_domain_data": audio_data.tolist(),
                "bass_level": float(bass_level),
                "mid_level": float(mid_level),
                "treble_level": float(treble_level),
                "overall_volume": float(overall_volume),
                "beat_detected": beat_detected,
                "energy_level": float(energy_level)
            }
            
            # Call callback function
            await callback_func(realtime_data)
            
        except Exception as e:
            logger.error(f"Error processing real-time audio: {str(e)}")
    
    def _calculate_band_level(self, magnitude: np.ndarray, freqs: np.ndarray, 
                             low_freq: float, high_freq: float) -> float:
        """Calculate energy level in a specific frequency band"""
        mask = (freqs >= low_freq) & (freqs <= high_freq)
        band_energy = np.sum(magnitude[mask])
        return band_energy
    
    def _detect_beat(self, audio_data: np.ndarray) -> bool:
        """Simple beat detection based on energy peaks"""
        # Calculate energy
        energy = np.sum(audio_data**2)
        
        # Simple threshold-based beat detection
        threshold = 0.1  # Adjust based on testing
        return energy > threshold
    
    def get_available_devices(self) -> List[Dict[str, Any]]:
        """Get list of available audio devices"""
        try:
            devices = sd.query_devices()
            device_list = []
            
            for i, device in enumerate(devices):
                device_info = {
                    "index": i,
                    "name": device["name"],
                    "channels": device["max_input_channels"],
                    "sample_rate": device["default_samplerate"]
                }
                device_list.append(device_info)
            
            return device_list
            
        except Exception as e:
            logger.error(f"Error getting audio devices: {str(e)}")
            return []
    
    def set_audio_device(self, device_index: int):
        """Set the audio input device"""
        try:
            sd.default.device[0] = device_index
            logger.info(f"Audio input device set to index: {device_index}")
        except Exception as e:
            logger.error(f"Error setting audio device: {str(e)}")
            raise e

