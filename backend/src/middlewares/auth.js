import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Unauthorized: No access token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // Attach user payload to the request object
    next();
  } catch (error) {
    return sendError(res, 'Unauthorized: Invalid or expired access token', 401);
  }
};