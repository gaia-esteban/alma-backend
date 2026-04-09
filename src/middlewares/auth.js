import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import userRepository from '../repositories/userRepository.js';
import logger from '../utils/logger.js';

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found',
      });
    }

    // Attach user to request (excluding sensitive fields)
    req.user = user.toJSON();
    next();
  } catch (error) {
    logger.error({ err: error }, 'Authentication error');

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
}

/**
 * Authorization Middleware - Admin Only
 * Verifies that authenticated user is an admin
 */
export function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (req.user.role !== 'admin') {
      logger.warn(`Unauthorized admin access attempt by user: ${req.user.username}`);
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    logger.error({ err: error }, 'Authorization error');
    return res.status(500).json({
      success: false,
      message: 'Authorization failed',
    });
  }
}

/**
 * Authorization Middleware - User or Admin
 * Verifies that authenticated user can access their own resources or is an admin
 */
export function requireOwnerOrAdmin(resourceField = 'id') {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const resourceId = req.params[resourceField];

      // Allow if user is admin or accessing their own resource
      if (req.user.role === 'admin' || req.user.id === resourceId) {
        return next();
      }

      logger.warn(
        `Unauthorized resource access attempt by user: ${req.user.username} for resource: ${resourceId}`
      );

      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    } catch (error) {
      logger.error({ err: error }, 'Authorization error');
      return res.status(500).json({
        success: false,
        message: 'Authorization failed',
      });
    }
  };
}

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is provided, but doesn't require it
 */
export async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await userRepository.findById(decoded.id);

    if (user) {
      req.user = user.toJSON();
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    logger.debug('Optional authentication failed:', error.message);
    next();
  }
}

export default {
  authenticate,
  requireAdmin,
  requireOwnerOrAdmin,
  optionalAuthenticate,
};
