import { Document } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: string;
  email: string;
  username: string;
  password: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark';
    defaultVisualPreset?: string;
    audioSettings: {
      sensitivity: number;
      bassBoost: boolean;
      trebleBoost: boolean;
    };
  };
  xp: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInput {
  email: string;
  username: string;
  password: string;
}

export interface IUserUpdate {
  username?: string;
  avatar?: string;
  preferences?: Partial<IUser['preferences']>;
}

// Song Types
export interface ISong extends Document {
  _id: string;
  title: string;
  artist: string;
  duration: number;
  fileUrl: string;
  thumbnailUrl?: string;
  audioAnalysis: {
    bpm: number;
    key: string;
    energy: number;
    valence: number;
    danceability: number;
    tempo: number;
    loudness: number;
    spectralCentroid: number[];
    mfcc: number[][];
    chroma: number[][];
  };
  uploadedBy: string;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISongInput {
  title: string;
  artist: string;
  fileUrl: string;
  thumbnailUrl?: string;
  isPublic?: boolean;
  tags?: string[];
}

// Visual Preset Types
export interface IVisualPreset extends Document {
  _id: string;
  name: string;
  description: string;
  type: '2d' | '3d' | 'particle' | 'waveform' | 'spectrum';
  config: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      accent: string[];
    };
    effects: {
      particles: boolean;
      waves: boolean;
      spectrum: boolean;
      waveform: boolean;
      bassReactive: boolean;
    };
    settings: {
      sensitivity: number;
      smoothness: number;
      intensity: number;
      speed: number;
    };
    shaders?: {
      vertex: string;
      fragment: string;
    };
  };
  createdBy: string;
  isPublic: boolean;
  tags: string[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVisualPresetInput {
  name: string;
  description: string;
  type: IVisualPreset['type'];
  config: IVisualPreset['config'];
  isPublic?: boolean;
  tags?: string[];
}

// Audio Analysis Types
export interface IAudioAnalysis {
  bpm: number;
  key: string;
  energy: number;
  valence: number;
  danceability: number;
  tempo: number;
  loudness: number;
  spectralCentroid: number[];
  mfcc: number[][];
  chroma: number[][];
  onsetTimes: number[];
  beatTimes: number[];
  segmentTimbre: number[][];
  segmentPitches: number[][];
}

// Real-time Data Types
export interface IRealtimeAudioData {
  timestamp: number;
  frequencyData: number[];
  timeDomainData: number[];
  bassLevel: number;
  midLevel: number;
  trebleLevel: number;
  overallVolume: number;
  beatDetected: boolean;
  energyLevel: number;
}

export interface IRealtimeVisualData {
  timestamp: number;
  presetId: string;
  parameters: {
    colorIntensity: number;
    particleCount: number;
    waveAmplitude: number;
    spectrumBars: number[];
    bassReaction: number;
  };
}

// Socket Event Types
export interface ISocketEvents {
  'audio:data': (data: IRealtimeAudioData) => void;
  'visual:update': (data: IRealtimeVisualData) => void;
  'preset:change': (presetId: string) => void;
  'user:join': (userId: string) => void;
  'user:leave': (userId: string) => void;
  'room:join': (roomId: string) => void;
  'room:leave': (roomId: string) => void;
  'error': (error: string) => void;
}

// API Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication Types
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IJwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Upload Types
export interface IUploadResult {
  url: string;
  publicId: string;
  format: string;
  size: number;
  duration?: number;
}

// Error Types
export interface IAppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Configuration Types
export interface IAppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  mongoUri: string;
  redisUrl: string;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3Bucket: string;
  };
}
