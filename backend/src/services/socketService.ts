import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { VisualPreset } from '../models/VisualPreset';
import { logger } from '../utils/logger';
import { redisUtils } from '../config/redis';
import { IRealtimeAudioData, IRealtimeVisualData } from '../types';

interface AuthenticatedSocket extends Socket {
  user?: any;
}

export const setupSocketHandlers = (io: SocketIOServer) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return next(new Error('Authentication error: JWT secret not configured'));
      }

      const decoded = jwt.verify(token, jwtSecret) as any;
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User ${socket.user?.username} connected with socket ${socket.id}`);

    // Join user to their personal room
    socket.join(`user:${socket.user._id}`);

    // Handle joining visual rooms
    socket.on('join:visual-room', async (roomId: string) => {
      try {
        socket.join(`visual:${roomId}`);
        logger.info(`User ${socket.user?.username} joined visual room ${roomId}`);
        
        // Notify others in the room
        socket.to(`visual:${roomId}`).emit('user:joined', {
          userId: socket.user._id,
          username: socket.user.username,
          timestamp: new Date().toISOString()
        });

        // Send current room state
        const roomState = await redisUtils.get(`visual:room:${roomId}:state`);
        if (roomState) {
          socket.emit('room:state', roomState);
        }
      } catch (error) {
        logger.error('Error joining visual room:', error);
        socket.emit('error', 'Failed to join visual room');
      }
    });

    // Handle leaving visual rooms
    socket.on('leave:visual-room', (roomId: string) => {
      socket.leave(`visual:${roomId}`);
      logger.info(`User ${socket.user?.username} left visual room ${roomId}`);
      
      // Notify others in the room
      socket.to(`visual:${roomId}`).emit('user:left', {
        userId: socket.user._id,
        username: socket.user.username,
        timestamp: new Date().toISOString()
      });
    });

    // Handle audio data streaming
    socket.on('audio:data', async (audioData: IRealtimeAudioData) => {
      try {
        // Store audio data in Redis for real-time access
        await redisUtils.set(
          `audio:${socket.user._id}:latest`,
          audioData,
          5 // Expire in 5 seconds
        );

        // Broadcast to visual rooms the user is in
        const rooms = Array.from(socket.rooms).filter(room => room.startsWith('visual:'));
        rooms.forEach(room => {
          socket.to(room).emit('audio:data', {
            ...audioData,
            userId: socket.user._id,
            username: socket.user.username
          });
        });

        // Process audio data for visual generation
        await processAudioForVisuals(audioData, socket.user._id);
      } catch (error) {
        logger.error('Error processing audio data:', error);
        socket.emit('error', 'Failed to process audio data');
      }
    });

    // Handle visual preset changes
    socket.on('preset:change', async (presetId: string) => {
      try {
        const preset = await VisualPreset.findById(presetId);
        if (!preset) {
          socket.emit('error', 'Visual preset not found');
          return;
        }

        // Update user's current preset
        await redisUtils.set(`user:${socket.user._id}:current-preset`, presetId, 3600);

        // Broadcast preset change to visual rooms
        const rooms = Array.from(socket.rooms).filter(room => room.startsWith('visual:'));
        rooms.forEach(room => {
          socket.to(room).emit('preset:changed', {
            presetId,
            preset: preset,
            userId: socket.user._id,
            username: socket.user.username,
            timestamp: new Date().toISOString()
          });
        });

        // Increment preset usage count
        await preset.incrementUsage();

        logger.info(`User ${socket.user?.username} changed preset to ${preset.name}`);
      } catch (error) {
        logger.error('Error changing preset:', error);
        socket.emit('error', 'Failed to change visual preset');
      }
    });

    // Handle visual parameter updates
    socket.on('visual:parameters', async (parameters: any) => {
      try {
        // Store visual parameters
        await redisUtils.set(
          `visual:${socket.user._id}:parameters`,
          parameters,
          3600
        );

        // Broadcast to visual rooms
        const rooms = Array.from(socket.rooms).filter(room => room.startsWith('visual:'));
        rooms.forEach(room => {
          socket.to(room).emit('visual:parameters:updated', {
            parameters,
            userId: socket.user._id,
            username: socket.user.username,
            timestamp: new Date().toISOString()
          });
        });
      } catch (error) {
        logger.error('Error updating visual parameters:', error);
        socket.emit('error', 'Failed to update visual parameters');
      }
    });

    // Handle chat messages in visual rooms
    socket.on('chat:message', (data: { roomId: string; message: string }) => {
      const { roomId, message } = data;
      
      if (!message.trim()) return;

      const chatMessage = {
        userId: socket.user._id,
        username: socket.user.username,
        message: message.trim(),
        timestamp: new Date().toISOString()
      };

      // Broadcast to the specific visual room
      io.to(`visual:${roomId}`).emit('chat:message', chatMessage);
      
      // Store in Redis for chat history
      redisUtils.get(`chat:${roomId}:history`).then(history => {
        const messages = history || [];
        messages.push(chatMessage);
        
        // Keep only last 100 messages
        if (messages.length > 100) {
          messages.splice(0, messages.length - 100);
        }
        
        redisUtils.set(`chat:${roomId}:history`, messages, 86400); // 24 hours
      });

      logger.info(`Chat message from ${socket.user?.username} in room ${roomId}`);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`User ${socket.user?.username} disconnected: ${reason}`);
      
      // Notify all rooms the user was in
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room.startsWith('visual:')) {
          socket.to(room).emit('user:left', {
            userId: socket.user._id,
            username: socket.user.username,
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.user?.username}:`, error);
    });
  });

  // Periodic cleanup of expired data
  setInterval(async () => {
    try {
      // Clean up old audio data
      const keys = await redisUtils.get('audio:*');
      // Implementation would depend on your Redis client's key scanning capabilities
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }, 60000); // Every minute
};

// Process audio data for visual generation
async function processAudioForVisuals(audioData: IRealtimeAudioData, userId: string) {
  try {
    // Calculate visual parameters based on audio data
    const visualData: IRealtimeVisualData = {
      timestamp: audioData.timestamp,
      presetId: await redisUtils.get(`user:${userId}:current-preset`) || 'default',
      parameters: {
        colorIntensity: Math.min(audioData.energyLevel * 2, 1),
        particleCount: Math.floor(audioData.bassLevel * 100),
        waveAmplitude: audioData.overallVolume * 0.5,
        spectrumBars: audioData.frequencyData.slice(0, 32), // First 32 frequency bins
        bassReaction: audioData.bassLevel
      }
    };

    // Store visual data
    await redisUtils.set(
      `visual:${userId}:latest`,
      visualData,
      5 // Expire in 5 seconds
    );

    // Publish to Redis for other services
    await redisUtils.publish(`visual:${userId}`, visualData);
  } catch (error) {
    logger.error('Error processing audio for visuals:', error);
  }
}
