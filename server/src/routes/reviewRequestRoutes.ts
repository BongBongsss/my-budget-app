import { Router, Request, Response } from 'express';
import {
  createReviewRequest,
  createBulkReviewRequests,
  deleteReviewRequest,
  listReviewRequests,
  updateReviewRequestStatus,
} from '../services/reviewRequestService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

const router = Router();

const requireAdmin = (req: Request) => {
  if (req.session?.role !== 'admin') {
    throw new UnauthorizedError('Admin role required');
  }
};

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const requests = await listReviewRequests({
    targetType: typeof req.query.targetType === 'string' ? req.query.targetType : undefined,
    targetId: typeof req.query.targetId === 'string' ? req.query.targetId : undefined,
    status: typeof req.query.status === 'string' ? req.query.status : undefined,
  });
  res.json(requests);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { targetType, targetId, type, title, body } = req.body;
  if (!targetType || !title || !body) {
    throw new BadRequestError('targetType, title, and body are required');
  }

  const request = await createReviewRequest({
    targetType,
    targetId,
    type,
    title,
    body,
    authorRole: req.session?.role,
  });
  res.status(201).json(request);
}));

router.post('/bulk', asyncHandler(async (req: Request, res: Response) => {
  requireAdmin(req);
  const { targets, body } = req.body || {};
  if (!Array.isArray(targets) || targets.length === 0 || !body) {
    throw new BadRequestError('targets and body are required');
  }

  const uniqueTargets = new Map<string, { targetType: 'transaction' | 'importRow'; targetId: string; title: string }>();
  for (const target of targets) {
    if (!target || (target.targetType !== 'transaction' && target.targetType !== 'importRow') || typeof target.targetId !== 'string' || !target.targetId || typeof target.title !== 'string' || !target.title.trim()) {
      throw new BadRequestError('Each target must be a transaction or import row');
    }
    uniqueTargets.set(`${target.targetType}:${target.targetId}`, target);
  }

  const requests = await createBulkReviewRequests({
    targets: [...uniqueTargets.values()],
    body,
    authorRole: req.session?.role,
  });
  res.status(201).json({ count: requests.length, ids: requests.map((request) => request.id) });
}));

router.patch('/:id/status', asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (status !== 'open' && status !== 'done') {
    throw new BadRequestError('status must be open or done');
  }

  const request = await updateReviewRequestStatus(req.params.id as string, status);
  res.json(request);
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  requireAdmin(req);
  await deleteReviewRequest(req.params.id as string);
  res.json({ success: true });
}));

export default router;
