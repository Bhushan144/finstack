import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roleGuard.js';
import * as userController from '../controllers/userController.js';

const router = Router();

// Protect all user routes
router.use(authenticate);

// STRICT GUARD: Only Admins can access these endpoints
router.use(requireRole(['ADMIN']));

router.get('/', userController.getAllUsers);
router.put('/:id', userController.updateUser); // Promote roles or deactivate accounts

export default router;