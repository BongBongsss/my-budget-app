import { Router, Request, Response } from 'express';
import {
  createReviewRequest,
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
