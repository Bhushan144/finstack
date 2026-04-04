import { sendError } from '../utils/apiResponse.js';
import env from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  if (env.NODE_ENV !== 'production') console.error('Error:', err);

  // MongoDB duplicate key error (e.g., email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, `${field} already exists`, 409, err.message);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, messages.join(', '), 400, err.message);
  }

  // Fallback
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return sendError(res, message, 500);
};