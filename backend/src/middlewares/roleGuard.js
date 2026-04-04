import { sendError } from '../utils/apiResponse.js';

export const requireRole = (allowedRoles) => (req, res, next) => {
  // Ensure the authenticate middleware has already run
  if (!req.user || !req.user.role) {
    return sendError(res, 'Unauthorized: User role not found', 401);
  }

  if (!allowedRoles.includes(req.user.role)) {
    return sendError(res, 'Forbidden: You do not have permission to perform this action', 403);
  }

  next();
};