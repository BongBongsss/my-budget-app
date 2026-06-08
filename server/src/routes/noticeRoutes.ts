import { Router, Request, Response } from 'express';
import { createNotice, deleteNotice, listNotices, markNoticeRead } from '../services/noticeService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

const router = Router();

const getRole = (req: Request): 'admin' | 'viewer' => req.session?.role || 'viewer';

const requireAdmin = (req: Request) => {
  if (req.session?.role !== 'admin') {
    throw new UnauthorizedError('Admin role required');
  }
};

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const notices = await listNotices({
    unreadOnly: req.query.unread === 'true',
    role: getRole(req),
  });
  res.json(notices);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  requireAdmin(req);
  const { title, body } = req.body;
  if (!title || !body) {
    throw new BadRequestError('title and body are required');
  }

  const notice = await createNotice({
    title,
    body,
    authorRole: req.session?.role,
  });
  res.status(201).json(notice);
}));

router.patch('/:id/read', asyncHandler(async (req: Request, res: Response) => {
  const notice = await markNoticeRead(req.params.id as string, getRole(req));
  res.json(notice);
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  requireAdmin(req);
  await deleteNotice(req.params.id as string);
  res.json({ success: true });
}));

export default router;
