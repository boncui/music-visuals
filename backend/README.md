# Music Visuals Backend

A real-time, audio-reactive visual experience backend built with Node.js, TypeScript, and Python microservices.

## 🏗️ Architecture Overview

This backend follows a microservices architecture with the following components:

- **Node.js/TypeScript API Server** - Main backend service with Express.js
- **Python Audio Analysis Service** - FastAPI microservice for audio processing
- **MongoDB** - Primary database for users, songs, and visual presets
- **Redis** - Caching and real-time data storage
- **Socket.IO** - Real-time WebSocket communication

## 🚀 Tech Stack

### Backend Services
- **Node.js 18+** with TypeScript
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** with Mongoose ODM
- **Redis** for caching and pub/sub
- **JWT** for authentication
- **Winston** for logging

### Audio Processing
- **Python 3.9+** with FastAPI
- **Librosa** - Audio analysis
- **Essentia** - Music information retrieval
- **NumPy/SciPy** - Numerical computing

### Infrastructure
- **Docker** & Docker Compose
- **Nginx** reverse proxy
- **GitHub Actions** CI/CD
- **Render.com** / **Fly.io** deployment

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication, validation, error handling
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic and Socket.IO
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions and logger
│   └── index.ts        # Main application entry point
├── python-service/     # Python audio analysis microservice
├── tests/              # Test files
├── logs/               # Application logs
├── docker-compose.yml  # Docker services configuration
├── Dockerfile          # Node.js container
└── package.json        # Dependencies and scripts
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB 6.0+
- Redis 7+
- Docker (optional)

### Local Development

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env with your configuration
```

3. **Start services with Docker Compose:**
```bash
docker-compose up -d
```

4. **Or start services individually:**
```bash
# Start MongoDB and Redis
mongod
redis-server

# Start Node.js backend
npm run dev

# Start Python audio service
cd python-service
pip install -r requirements.txt
python main.py
```

### Environment Variables

```env
# Node.js Backend
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/music-visuals?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
PYTHON_SERVICE_URL=http://localhost:8001

# Python Audio Service
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/songs` - Get user's songs
- `GET /api/users/presets` - Get user's visual presets

### Songs
- `GET /api/songs` - Get all public songs
- `GET /api/songs/:id` - Get song by ID
- `POST /api/songs` - Upload new song
- `PUT /api/songs/:id` - Update song
- `DELETE /api/songs/:id` - Delete song
- `GET /api/songs/:id/similar` - Get similar songs

### Visual Presets
- `GET /api/visuals/presets` - Get all visual presets
- `GET /api/visuals/presets/:id` - Get preset by ID
- `POST /api/visuals/presets` - Create new preset
- `PUT /api/visuals/presets/:id` - Update preset
- `DELETE /api/visuals/presets/:id` - Delete preset

### File Upload
- `POST /api/upload/audio` - Upload audio file
- `POST /api/upload/image` - Upload image file
- `GET /api/upload/status/:id` - Get upload status

## 🔄 Real-time Features

### Socket.IO Events

**Client → Server:**
- `audio:data` - Send real-time audio data
- `preset:change` - Change visual preset
- `visual:parameters` - Update visual parameters
- `join:visual-room` - Join visual room
- `chat:message` - Send chat message

**Server → Client:**
- `audio:data` - Receive audio data
- `visual:update` - Visual parameter updates
- `preset:changed` - Preset change notification
- `user:joined` - User joined room
- `chat:message` - Chat message received

## 🎵 Audio Analysis Features

The Python microservice provides:

- **Beat Detection** - BPM and beat tracking
- **Spectral Analysis** - Frequency domain features
- **MFCC Features** - Mel-frequency cepstral coefficients
- **Chroma Features** - Musical key detection
- **Energy Analysis** - Loudness and energy levels
- **Tempo Estimation** - Tempo and rhythm analysis

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🚀 Deployment Options

### Render.com
1. Connect your GitHub repository
2. Use `render.yaml` configuration
3. Set environment variables in dashboard

### Fly.io
1. Install Fly CLI
2. Run `fly deploy`
3. Configure with `fly.toml`

### AWS/GCP/Azure
Use the Docker containers with your preferred container orchestration service.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm run test:unit
npm run test:integration
```

## 📊 Monitoring & Logging

- **Winston** for structured logging
- **Health checks** at `/health`
- **Redis** for real-time metrics
- **Error tracking** with detailed stack traces

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Rate limiting** on API endpoints
- **CORS** configuration
- **Helmet** security headers
- **Input validation** with Joi
- **File upload** restrictions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API examples

---

**Built with ❤️ for the music visualization community**
