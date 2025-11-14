import mongoose, { Schema } from 'mongoose';
import { IVisualPreset, IVisualPresetInput } from '../types';

const visualPresetSchema = new Schema<IVisualPreset>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Preset name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['2d', '3d', 'particle', 'waveform', 'spectrum']
  },
  config: {
    colors: {
      primary: {
        type: String,
        required: true,
        match: [/^#[0-9A-F]{6}$/i, 'Primary color must be a valid hex color']
      },
      secondary: {
        type: String,
        required: true,
        match: [/^#[0-9A-F]{6}$/i, 'Secondary color must be a valid hex color']
      },
      background: {
        type: String,
        required: true,
        match: [/^#[0-9A-F]{6}$/i, 'Background color must be a valid hex color']
      },
      accent: [{
        type: String,
        match: [/^#[0-9A-F]{6}$/i, 'Accent colors must be valid hex colors']
      }]
    },
    effects: {
      particles: {
        type: Boolean,
        default: false
      },
      waves: {
        type: Boolean,
        default: false
      },
      spectrum: {
        type: Boolean,
        default: true
      },
      waveform: {
        type: Boolean,
        default: false
      },
      bassReactive: {
        type: Boolean,
        default: true
      }
    },
    settings: {
      sensitivity: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
        default: 0.5
      },
      smoothness: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
        default: 0.7
      },
      intensity: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
        default: 0.8
      },
      speed: {
        type: Number,
        required: true,
        min: 0,
        max: 2,
        default: 1
      }
    },
    shaders: {
      vertex: {
        type: String,
        default: null
      },
      fragment: {
        type: String,
        default: null
      }
    }
  },
  createdBy: {
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
  }],
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
visualPresetSchema.index({ name: 'text', description: 'text' });
visualPresetSchema.index({ createdBy: 1 });
visualPresetSchema.index({ isPublic: 1 });
visualPresetSchema.index({ type: 1 });
visualPresetSchema.index({ tags: 1 });
visualPresetSchema.index({ usageCount: -1 });
visualPresetSchema.index({ createdAt: -1 });

// Method to increment usage count
visualPresetSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Static method to get popular presets
visualPresetSchema.statics.getPopularPresets = function(limit: number = 10) {
  return this.find({ isPublic: true })
    .sort({ usageCount: -1 })
    .limit(limit)
    .populate('createdBy', 'username avatar');
};

// Static method to get presets by type
visualPresetSchema.statics.getPresetsByType = function(type: string, limit: number = 20) {
  return this.find({ type, isPublic: true })
    .sort({ usageCount: -1 })
    .limit(limit)
    .populate('createdBy', 'username avatar');
};

export const VisualPreset = mongoose.model<IVisualPreset>('VisualPreset', visualPresetSchema);
