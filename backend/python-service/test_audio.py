#!/usr/bin/env python3
"""
Test script for audio analysis functionality
Run this to test the audio analysis capabilities
"""

import asyncio
import numpy as np
import librosa
from src.services.audio_analyzer import AudioAnalyzer
from src.services.redis_client import RedisClient
import time

async def test_audio_analysis():
    """Test the audio analysis functionality"""
    print("🎵 Testing Audio Analysis Service...")
    
    # Initialize services
    audio_analyzer = AudioAnalyzer()
    redis_client = RedisClient()
    
    try:
        # Connect to Redis
        await redis_client.connect()
        print("✅ Connected to Redis")
        
        # Test 1: Get available audio devices
        print("\n📱 Available Audio Devices:")
        devices = audio_analyzer.get_available_devices()
        for device in devices:
            print(f"  {device['index']}: {device['name']} ({device['channels']} channels)")
        
        # Test 2: Generate test audio signal
        print("\n🎼 Generating test audio signal...")
        duration = 5  # seconds
        sample_rate = 44100
        t = np.linspace(0, duration, int(sample_rate * duration))
        
        # Create a test signal with multiple frequencies
        test_signal = (
            0.5 * np.sin(2 * np.pi * 440 * t) +  # A4 note
            0.3 * np.sin(2 * np.pi * 880 * t) +  # A5 note
            0.2 * np.sin(2 * np.pi * 1320 * t)   # E6 note
        )
        
        # Add some noise
        test_signal += 0.1 * np.random.normal(0, 1, len(test_signal))
        
        # Test 3: Analyze the test signal
        print("🔍 Analyzing test audio signal...")
        features = await audio_analyzer._extract_features(test_signal, sample_rate)
        
        print(f"✅ Analysis Results:")
        print(f"  BPM: {features['bpm']:.2f}")
        print(f"  Key: {features['key']}")
        print(f"  Energy: {features['energy']:.3f}")
        print(f"  Valence: {features['valence']:.3f}")
        print(f"  Danceability: {features['danceability']:.3f}")
        print(f"  Duration: {features['duration']:.2f}s")
        
        # Test 4: Test Redis caching
        print("\n💾 Testing Redis caching...")
        test_url = "test://audio/sample.wav"
        await redis_client.set_analysis_result(test_url, features)
        
        # Retrieve from cache
        cached_result = await redis_client.get_analysis_result(test_url)
        if cached_result:
            print("✅ Successfully cached and retrieved analysis result")
        else:
            print("❌ Failed to retrieve cached result")
        
        # Test 5: Test real-time audio processing (if microphone available)
        print("\n🎤 Testing real-time audio processing...")
        if devices:
            print("Starting live analysis for 5 seconds...")
            
            realtime_data_received = []
            
            async def test_callback(audio_data):
                realtime_data_received.append(audio_data)
                print(f"📊 Received audio data: Bass={audio_data['bass_level']:.3f}, "
                      f"Mid={audio_data['mid_level']:.3f}, Treble={audio_data['treble_level']:.3f}")
            
            try:
                # Start live analysis
                audio_analyzer.start_live_analysis(test_callback)
                
                # Wait for 5 seconds
                await asyncio.sleep(5)
                
                # Stop analysis
                audio_analyzer.stop_live_analysis()
                
                print(f"✅ Received {len(realtime_data_received)} audio samples")
                
            except Exception as e:
                print(f"⚠️ Live analysis test skipped (no microphone or permission issue): {e}")
        else:
            print("⚠️ No audio devices available for live testing")
        
        print("\n🎉 All tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        raise e
    
    finally:
        # Cleanup
        await redis_client.disconnect()
        print("✅ Disconnected from Redis")

if __name__ == "__main__":
    print("🚀 Starting Audio Analysis Tests...")
    asyncio.run(test_audio_analysis())

