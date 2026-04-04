export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data, error: null });
};

export const sendError = (res, message, statusCode = 400, errorDetails = null) => {
  return res.status(statusCode).json({ success: false, message, data: null, error: errorDetails || message });
};