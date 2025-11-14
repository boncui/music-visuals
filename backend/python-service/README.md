# Python Audio Analysis Service

A FastAPI microservice for real-time audio analysis and processing using the best-in-class audio libraries.

## 🎵 Features

### Audio Analysis
- **Real-time microphone capture** using `sounddevice`
- **FFT/Spectrum analysis** using `numpy` and `scipy.fftpack`
- **Beat/tempo tracking** using `librosa`
- **Signal smoothing/filtering** using `scipy.signal`
- **MFCC feature extraction**
- **Chroma feature analysis**
- **Key detection**
- **Energy and valence calculation**

### Real-time Processing
- Live audio streaming from microphone
- Real-time frequency analysis
- Beat detection
- Audio device management
- Redis caching and pub/sub

## 🛠️ Tech Stack

- **FastAPI** - Modern Python web framework
- **sounddevice** - Real-time audio I/O
- **librosa** - Music and audio analysis
- **numpy/scipy** - Numerical computing and signal processing
- **Redis** - Caching and real-time communication
- **Pydantic** - Data validation

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Redis server
- Audio device (microphone)

### Installation

1. **Install system dependencies:**
```bash
# Ubuntu/Debian
sudo apt-get install portaudio19-dev libsndfile1-dev ffmpeg

# macOS
brew install portaudio libsndfile ffmpeg

# Windows
# Install Visual Studio Build Tools
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set environment variables:**
```bash
export REDIS_URL=redis://localhost:6379
export LOG_LEVEL=info
```

4. **Run the service:**
```bash
python main.py
```

### Testing

Run the test script to verify functionality:
```bash
python test_audio.py
```

## 📡 API Endpoints

### File Analysis
- `POST /analyze` - Analyze audio file from URL
- `POST /analyze-upload` - Analyze uploaded audio file
- `GET /analysis/{file_hash}` - Get cached analysis result

### Live Audio Analysis
- `POST /live/start` - Start live microphone analysis
- `POST /live/stop` - Stop live analysis
- `GET /live/status` - Get analysis status

### Audio Devices
- `GET /devices` - List available audio devices
- `POST /devices/{device_index}` - Set audio input device

### Health Check
- `GET /health` - Service health status

## 🎛️ Audio Analysis Features

### Spectral Analysis
- Spectral centroid
- Spectral rolloff
- Spectral bandwidth
- Zero-crossing rate

### Beat Detection
- Tempo estimation
- Beat tracking
- Onset detection
- Rhythm analysis

### Feature Extraction
- MFCC (Mel-frequency cepstral coefficients)
- Chroma features
- Energy analysis
- Key detection

### Real-time Processing
- Live frequency analysis
- Bass/mid/treble level detection
- Beat detection
- Volume analysis

## 🔧 Configuration

### Audio Parameters
```python
sample_rate = 44100    # Audio sample rate
chunk_size = 1024      # Processing chunk size
hop_length = 512       # Librosa hop length
n_fft = 2048          # FFT window size
n_mfcc = 13           # Number of MFCC coefficients
```

### Redis Configuration
```python
REDIS_URL = "redis://localhost:6379"
CACHE_EXPIRY = 3600    # Analysis cache expiry (seconds)
REALTIME_EXPIRY = 5    # Real-time data expiry (seconds)
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t music-visuals-audio-service .

# Run container
docker run -p 8001:8001 \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  music-visuals-audio-service
```

## 🔍 Usage Examples

### Analyze Audio File
```python
import httpx

async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://localhost:8001/analyze",
        json={"file_url": "https://example.com/audio.mp3"}
    )
    analysis = response.json()
    print(f"BPM: {analysis['bpm']}")
    print(f"Key: {analysis['key']}")
```

### Start Live Analysis
```python
# Start live analysis
response = await client.post("http://localhost:8001/live/start")

# Get status
status = await client.get("http://localhost:8001/live/status")
print(f"Recording: {status['is_recording']}")
```

### Get Audio Devices
```python
devices = await client.get("http://localhost:8001/devices")
for device in devices['devices']:
    print(f"{device['index']}: {device['name']}")
```

## 🎯 Integration with Node.js Backend

The Python service integrates with the Node.js backend through:

1. **HTTP API calls** for file analysis
2. **Redis pub/sub** for real-time audio data
3. **Caching** for analysis results

### Node.js Integration Example
```javascript
// Call Python service for audio analysis
const response = await fetch('http://localhost:8001/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ file_url: audioFileUrl })
});

const analysis = await response.json();
// Store analysis in MongoDB
```

## 🐛 Troubleshooting

### Common Issues

1. **No audio devices found**
   - Check microphone permissions
   - Install audio drivers
   - Verify device is not in use

2. **PortAudio errors**
   - Install portaudio development libraries
   - Check audio device availability

3. **Redis connection issues**
   - Verify Redis server is running
   - Check connection URL
   - Test Redis connectivity

### Debug Mode
```bash
export LOG_LEVEL=debug
python main.py
```

## 📊 Performance

- **Latency**: < 50ms for real-time processing
- **CPU Usage**: ~10-20% for live analysis
- **Memory**: ~100MB base usage
- **Throughput**: Handles multiple concurrent analyses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for real-time audio visualization**

