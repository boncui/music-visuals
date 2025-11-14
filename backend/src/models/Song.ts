import mongoose, { Schema } from 'mongoose';
import { ISong, ISongInput } from '../types';

const songSchema = new Schema<ISong>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  artist: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Artist name cannot exceed 100 characters']
  },
  duration: {
    type: Number,
    required: true,
    min: [1, 'Duration must be at least 1 second']
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  audioAnalysis: {
    bpm: {
      type: Number,
      required: true,
      min: 0
    },
    key: {
      type: String,
      required: true,
      enum: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    },
    energy: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    valence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    danceability: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    tempo: {
      type: Number,
      required: true,
      min: 0
    },
    loudness: {
      type: Number,
      required: true
    },
    spectralCentroid: [{
      type: Number,
      min: 0
    }],
    mfcc: [[{
      type: Number
    }]],
    chroma: [[{
      type: Number,
      min: 0,
      max: 1
    }]]
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
songSchema.index({ title: 'text', artist: 'text' });
songSchema.index({ uploadedBy: 1 });
songSchema.index({ isPublic: 1 });
songSchema.index({ tags: 1 });
songSchema.index({ createdAt: -1 });
songSchema.index({ 'audioAnalysis.bpm': 1 });
songSchema.index({ 'audioAnalysis.energy': 1 });
songSchema.index({ 'audioAnalysis.valence': 1 });

// Virtual for play count
songSchema.virtual('playCount', {
  ref: 'PlayHistory',
  localField: '_id',
  foreignField: 'song',
  count: true
});

// Method to get similar songs based on audio features
songSchema.methods.getSimilarSongs = async function(limit: number = 10) {
  const Song = mongoose.model('Song');
  
  return Song.find({
    _id: { $ne: this._id },
    'audioAnalysis.bpm': { $gte: this.audioAnalysis.bpm - 10, $lte: this.audioAnalysis.bpm + 10 },
    'audioAnalysis.energy': { $gte: this.audioAnalysis.energy - 0.2, $lte: this.audioAnalysis.energy + 0.2 },
    'audioAnalysis.valence': { $gte: this.audioAnalysis.valence - 0.2, $lte: this.audioAnalysis.valence + 0.2 }
  })
  .limit(limit)
  .populate('uploadedBy', 'username avatar');
};

export const Song = mongoose.model<ISong>('Song', songSchema);
