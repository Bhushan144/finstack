import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../schemas/userSchema.js';
import * as authController from '../controllers/authController.js';

const router = Router();

// Public Routes (No authentication required)
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Token Refresh & Logout rely on the HttpOnly cookie, NOT the Access Token headers
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;