import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();
const authController = new AuthController();

// Register new user
router.post('/register',
  validateRequest(Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(20).alphanum().required(),
    password: Joi.string().min(6).required()
  })),
  authController.register
);

// Login user
router.post('/login',
  validateRequest(Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })),
  authController.login
);

// Refresh token
router.post('/refresh',
  validateRequest(Joi.object({
    refreshToken: Joi.string().required()
  })),
  authController.refreshToken
);

// Logout user
router.post('/logout', authController.logout);

// Forgot password
router.post('/forgot-password',
  validateRequest(Joi.object({
    email: Joi.string().email().required()
  })),
  authController.forgotPassword
);

// Reset password
router.post('/reset-password',
  validateRequest(Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required()
  })),
  authController.resetPassword
);

export default router;
