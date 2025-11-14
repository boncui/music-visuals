import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { validateRequest, validateQuery, commonSchemas } from '../middleware/validation';
import { VisualController } from '../controllers/visualController';
import Joi from 'joi';

const router = Router();
const visualController = new VisualController();

// Get all public visual presets
router.get('/presets',
  optionalAuth,
  validateQuery(commonSchemas.pagination.keys({
    type: Joi.string().valid('2d', '3d', 'particle', 'waveform', 'spectrum').optional(),
    popular: Joi.boolean().optional()
  })),
  visualController.getPresets
);

// Get preset by ID
router.get('/presets/:id',
  optionalAuth,
  validateRequest(Joi.object({
    id: commonSchemas.mongoId
  })),
  visualController.getPresetById
);

// Create new visual preset
router.post('/presets',
  authenticateToken,
  validateRequest(Joi.object({
    name: Joi.string().min(1).max(50).required(),
    description: Joi.string().min(1).max(500).required(),
    type: Joi.string().valid('2d', '3d', 'particle', 'waveform', 'spectrum').required(),
    config: Joi.object({
      colors: Joi.object({
        primary: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
        secondary: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
        background: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
        accent: Joi.array().items(Joi.string().pattern(/^#[0-9A-F]{6}$/i)).max(5).optional()
      }).required(),
      effects: Joi.object({
        particles: Joi.boolean().default(false),
        waves: Joi.boolean().default(false),
        spectrum: Joi.boolean().default(true),
        waveform: Joi.boolean().default(false),
        bassReactive: Joi.boolean().default(true)
      }).required(),
      settings: Joi.object({
        sensitivity: Joi.number().min(0).max(1).default(0.5),
        smoothness: Joi.number().min(0).max(1).default(0.7),
        intensity: Joi.number().min(0).max(1).default(0.8),
        speed: Joi.number().min(0).max(2).default(1)
      }).required(),
      shaders: Joi.object({
        vertex: Joi.string().optional(),
        fragment: Joi.string().optional()
      }).optional()
    }).required(),
    isPublic: Joi.boolean().default(true),
    tags: Joi.array().items(Joi.string().max(20)).max(10).optional()
  })),
  visualController.createPreset
);

// Update visual preset
router.put('/presets/:id',
  authenticateToken,
  validateRequest(Joi.object({
    id: commonSchemas.mongoId,
    name: Joi.string().min(1).max(50).optional(),
    description: Joi.string().min(1).max(500).optional(),
    config: Joi.object().optional(),
    isPublic: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string().max(20)).max(10).optional()
  })),
  visualController.updatePreset
);

// Delete visual preset
router.delete('/presets/:id',
  authenticateToken,
  validateRequest(Joi.object({
    id: commonSchemas.mongoId
  })),
  visualController.deletePreset
);

// Get real-time visual data
router.get('/realtime/:userId',
  authenticateToken,
  validateRequest(Joi.object({
    userId: commonSchemas.mongoId
  })),
  visualController.getRealtimeData
);

export default router;
