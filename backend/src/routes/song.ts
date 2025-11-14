import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { validateRequest, validateQuery, commonSchemas } from '../middleware/validation';
import { SongController } from '../controllers/songController';
import Joi from 'joi';

const router = Router();
const songController = new SongController();

// Get all public songs
router.get('/',
  optionalAuth,
  validateQuery(commonSchemas.pagination.keys({
    genre: Joi.string().optional(),
    bpm_min: Joi.number().min(0).optional(),
    bpm_max: Joi.number().min(0).optional(),
    energy_min: Joi.number().min(0).max(1).optional(),
    energy_max: Joi.number().min(0).max(1).optional()
  })),
  songController.getSongs
);

// Get song by ID
router.get('/:id',
  optionalAuth,
  validateRequest(Joi.object({
    id: commonSchemas.mongoId
  })),
  songController.getSongById
);

// Upload new song
router.post('/',
  authenticateToken,
  validateRequest(Joi.object({
    title: Joi.string().min(1).max(100).required(),
    artist: Joi.string().min(1).max(100).required(),
    fileUrl: Joi.string().uri().required(),
    thumbnailUrl: Joi.string().uri().optional(),
    isPublic: Joi.boolean().default(true),
    tags: Joi.array().items(Joi.string().max(20)).max(10).optional()
  })),
  songController.uploadSong
);

// Update song
router.put('/:id',
  authenticateToken,
  validateRequest(Joi.object({
    id: commonSchemas.mongoId,
    title: Joi.string().min(1).max(100).optional(),
    artist: Joi.string().min(1).max(100).optional(),
    isPublic: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string().max(20)).max(10).optional()
  })),
  songController.updateSong
);

// Delete song
router.delete('/:id',
  authenticateToken,
  validateRequest(Joi.object({
    id: commonSchemas.mongoId
  })),
  songController.deleteSong
);

// Get similar songs
router.get('/:id/similar',
  optionalAuth,
  validateRequest(Joi.object({
    id: commonSchemas.mongoId
  })),
  songController.getSimilarSongs
);

// Analyze song audio
router.post('/:id/analyze',
  authenticateToken,
  validateRequest(Joi.object({
    id: commonSchemas.mongoId
  })),
  songController.analyzeSong
);

export default router;
