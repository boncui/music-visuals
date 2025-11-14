import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, commonSchemas } from '../middleware/validation';
import { UserController } from '../controllers/userController';
import Joi from 'joi';

const router = Router();
const userController = new UserController();

// Get current user profile
router.get('/profile', authenticateToken, userController.getProfile);

// Update user profile
router.put('/profile', 
  authenticateToken,
  validateRequest(Joi.object({
    username: Joi.string().min(3).max(20).alphanum().optional(),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark').optional(),
      defaultVisualPreset: Joi.string().optional(),
      audioSettings: Joi.object({
        sensitivity: Joi.number().min(0).max(1).optional(),
        bassBoost: Joi.boolean().optional(),
        trebleBoost: Joi.boolean().optional()
      }).optional()
    }).optional()
  })),
  userController.updateProfile
);

// Get user's songs
router.get('/songs',
  authenticateToken,
  validateRequest(commonSchemas.pagination),
  userController.getUserSongs
);

// Get user's visual presets
router.get('/presets',
  authenticateToken,
  validateRequest(commonSchemas.pagination),
  userController.getUserPresets
);

// Get user statistics
router.get('/stats', authenticateToken, userController.getUserStats);

export default router;
