import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roleGuard.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();

// Protect all dashboard routes with the authentication gatekeeper
router.use(authenticate);

// Only Admins and Analysts can view the dashboard summaries
router.get('/', requireRole(['ADMIN', 'ANALYST', 'VIEWER']), dashboardController.getDashboardSummary);

export default router;