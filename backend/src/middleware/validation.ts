import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      logger.warn('Validation error:', errorMessage);
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      logger.warn('Query validation error:', errorMessage);
      
      return res.status(400).json({
        success: false,
        message: 'Query validation error',
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      logger.warn('Params validation error:', errorMessage);
      
      return res.status(400).json({
        success: false,
        message: 'Params validation error',
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  mongoId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().min(3).max(20).alphanum().required(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().default('-createdAt'),
    search: Joi.string().optional()
  })
};
