import { sendError } from '../utils/apiResponse.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.flatten().fieldErrors;
    return sendError(res, 'Validation failed', 400, formattedErrors);
  }
  req.body = result.data; // Replace req.body with sanitized data
  next();
};