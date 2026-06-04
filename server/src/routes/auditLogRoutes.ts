import { Router, Request, Response } from 'express';
import { getAuditLogs, restoreTransactionFromAuditLog } from '../services/auditLogService';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

const getAuditActor = (req: Request) => ({
  role: req.session?.role,
  ipAddress: req.ip,
});

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
  const page = typeof req.query.page === 'string' ? Number(req.query.page) : undefined;
  const result = await getAuditLogs({
    entityType: typeof req.query.entityType === 'string' ? req.query.entityType : undefined,
    action: typeof req.query.action === 'string' ? req.query.action : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
    page: Number.isFinite(page) ? page : undefined,
  });

  res.json(result);
}));

router.post('/:id/restore', asyncHandler(async (req: Request, res: Response) => {
  const transaction = await restoreTransactionFromAuditLog(String(req.params.id), getAuditActor(req));
  res.json({ success: true, transaction });
}));

export default router;
