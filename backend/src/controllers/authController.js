import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Helper: Generate Access & Refresh Tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, env.ACCESS_TOKEN_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRY });

  const refreshToken = jwt.sign({ id: userId, role }, env.REFRESH_TOKEN_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRY });

  return { accessToken, refreshToken };
};

// Helper: Parse JWT string (e.g., '7d', '15m') into milliseconds for the cookie
const parseExpiryToMs = (expiryString) => {
  const match = expiryString.match(/^(\d+)([smhdw])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // Default: 7 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'w': return value * 7 * 24 * 60 * 60 * 1000;
    default:  return 7 * 24 * 60 * 60 * 1000;
  }
};

// Helper: Dynamic Cookie Options driven purely by .env
const cookieOptions = {
  httpOnly: true, // Prevents XSS attacks
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: parseExpiryToMs(env.REFRESH_TOKEN_EXPIRY) // Dynamically parsed from .env
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
  // Creates user (password is hashed automatically by the Mongoose hook)
  const user = await User.create({ name, email, password });
  
  sendSuccess(res, { id: user._id, name: user.name, role: user.role }, 'Registered successfully as VIEWER', 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return sendError(res, 'Invalid email or password', 401);
  }
  if (!user.isActive) {
    return sendError(res, 'Account is deactivated. Contact an Admin.', 403);
  }

  // 1. Generate Tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // 2. STATEFUL FIX: Save the refresh token to the database
  user.refreshToken = refreshToken;
  await user.save(); // Safe to use save() because our pre-save hook checks isModified('password')

  // 3. Send Response
  res.cookie('refreshToken', refreshToken, cookieOptions);
  sendSuccess(res, { accessToken, user: { id: user._id, name: user.name, role: user.role } }, 'Login successful');
});

export const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) return sendError(res, 'No refresh token provided', 401);

  try {
    // 1. Verify token signature
    const decoded = jwt.verify(incomingRefreshToken, env.REFRESH_TOKEN_SECRET);
    
    // 2. STATEFUL FIX: Verify token matches the one in the database
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      return sendError(res, 'Refresh token is invalid or has been revoked', 401);
    }

    // 3. Re-issue fresh Access Token (and optionally a new Refresh Token, though keeping the current one is fine for this scope)
    const accessToken = jwt.sign({ id: user._id, role: user.role }, env.ACCESS_TOKEN_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRY });
    
    sendSuccess(res, { accessToken }, 'Token refreshed successfully');
  } catch (error) {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }
});


export const logout = asyncHandler(async (req, res) => {
  // 1. Read the cookie directly (Bypasses the need for a valid Access Token)
  const incomingRefreshToken = req.cookies.refreshToken;

  // 2. Define clear options (Stripping out maxAge)
  const clearOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // 3. Always clear the cookie on the client browser, even if DB fails
  res.clearCookie('refreshToken', clearOptions);

  // 4. If they had a token, find who owns it and wipe it from the DB
  if (incomingRefreshToken) {
    await User.findOneAndUpdate(
      { refreshToken: incomingRefreshToken },
      { $unset: { refreshToken: 1 } }
    );
  }

  sendSuccess(res, null, 'Logged out successfully');
});