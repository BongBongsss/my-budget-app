import { Router, Request, Response } from 'express';
import { getAuditLogs, getLatestRestorableBatch, restoreAuditLogs, restoreLatestAuditBatch, restoreTransactionFromAuditLog } from '../services/auditLogService';
import { saveAssetHistory } from '../services/assetService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

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

router.get('/latest-batch', asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getLatestRestorableBatch());
}));

router.post('/latest-batch/restore', asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, ...(await restoreLatestAuditBatch(getAuditActor(req))) });
}));

router.post('/restore', asyncHandler(async (req: Request, res: Response) => {
  const { auditLogIds } = req.body;
  if (!Array.isArray(auditLogIds) || auditLogIds.some((id) => typeof id !== 'string')) {
    throw new BadRequestError('Expected an array of audit log IDs.');
  }

  const result = await restoreAuditLogs(auditLogIds, getAuditActor(req));
  if (result.restoredAsset) await saveAssetHistory();
  res.json({ success: true, count: result.count });
}));

router.post('/:id/restore', asyncHandler(async (req: Request, res: Response) => {
  const transaction = await restoreTransactionFromAuditLog(String(req.params.id), getAuditActor(req));
  if ((transaction as any)?.type && Object.prototype.hasOwnProperty.call(transaction as any, 'balance')) {
    await saveAssetHistory();
  }
  res.json({ success: true, transaction });
}));

export default router;
