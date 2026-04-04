import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roleGuard.js';
import { validate } from '../middlewares/validate.js';
import { transactionSchema } from '../schemas/transactionSchema.js';
import * as transactionController from '../controllers/transactionController.js';

const router = Router();

// Protect all transaction routes
router.use(authenticate);

// Viewers can only READ. Analysts can READ. Admins can do EVERYTHING.
router.get('/', requireRole(['ADMIN', 'ANALYST', 'VIEWER']), transactionController.getAll);

// Only Admins and Analysts can create/update (assuming Analysts are allowed to input data in your business logic. If not, remove 'ANALYST' from these arrays).
router.post('/', requireRole(['ADMIN', 'ANALYST']), validate(transactionSchema), transactionController.create);
router.put('/:id', requireRole(['ADMIN', 'ANALYST']), validate(transactionSchema), transactionController.update);

// Only Admins have the authority to delete financial records
router.delete('/:id', requireRole(['ADMIN']), transactionController.remove);

export default router;