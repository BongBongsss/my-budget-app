import { Router, Request, Response } from 'express';
import { 
  getAllRecurringTransactions, 
  addRecurringTransaction, 
  deleteRecurringTransaction,
  updateRecurringTransaction,
  getRecurringCandidates,
  deferRecurringCandidate,
  ignoreRecurringCandidate,
  getIgnoredRecurringCandidates,
  restoreIgnoredRecurringCandidate,
  getMissingRecurringTransactions,
  addMissingRecurringTransaction,
  confirmRecurringMatch,
} from '../services/recurringService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();

const validateRecurringInput = (body: Record<string, unknown>, partial = false) => {
  const data = { ...body } as Record<string, unknown>;
  const has = (key: string) => data[key] !== undefined;

  if (!partial || has('vendor')) {
    if (typeof data.vendor !== 'string' || !data.vendor.trim()) throw new BadRequestError('고정비 내용은 필수입니다.');
    data.vendor = data.vendor.trim();
  }
  if (!partial || has('category')) {
    if (typeof data.category !== 'string' || !data.category.trim()) throw new BadRequestError('고정비 분류는 필수입니다.');
    data.category = data.category.trim();
  }
  if (!partial || has('amount')) {
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestError('예상 금액은 0원보다 커야 합니다.');
    data.amount = amount;
  }
  if (!partial || has('day_of_month')) {
    const day = Number(data.day_of_month);
    if (!Number.isInteger(day) || day < 1 || day > 28) throw new BadRequestError('예정일은 매월 1일부터 28일 사이여야 합니다.');
    data.day_of_month = day;
  }
  if (!partial || has('member')) {
    if (data.member !== '효' && data.member !== '굥') throw new BadRequestError('고정비 구성원은 효 또는 굥으로 선택해 주세요.');
  }
  return data;
};

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const yearMonth = typeof req.query.yearMonth === 'string' && /^\d{4}-\d{2}$/.test(req.query.yearMonth) ? req.query.yearMonth : undefined;
  const recurring = await getAllRecurringTransactions(yearMonth);
  res.json(recurring);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const recurring = await addRecurringTransaction(validateRecurringInput(req.body) as Parameters<typeof addRecurringTransaction>[0]);
  res.status(201).json(recurring);
}));

router.get('/candidates', asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getRecurringCandidates());
}));

router.get('/missing', asyncHandler(async (req: Request, res: Response) => {
  const yearMonth = typeof req.query.yearMonth === 'string' ? req.query.yearMonth : undefined;
  res.json(await getMissingRecurringTransactions(yearMonth));
}));

router.post('/:id/add-missing', asyncHandler(async (req: Request, res: Response) => {
  const yearMonth = typeof req.body?.yearMonth === 'string' ? req.body.yearMonth : undefined;
  const actualAmount = req.body?.amount === undefined ? undefined : Number(req.body.amount);
  if (actualAmount !== undefined && (!Number.isFinite(actualAmount) || actualAmount <= 0)) {
    throw new BadRequestError('Amount must be greater than zero');
  }
  res.status(201).json(await addMissingRecurringTransaction(req.params.id as string, yearMonth, { role: (req as any).session?.role || 'admin', ipAddress: req.ip }, actualAmount));
}));

router.post('/:id/confirm-match', asyncHandler(async (req: Request, res: Response) => {
  const { transactionId, yearMonth } = req.body || {};
  if (typeof transactionId !== 'string' || typeof yearMonth !== 'string' || !/^\d{4}-\d{2}$/.test(yearMonth)) throw new BadRequestError('transactionId and yearMonth are required');
  res.json(await confirmRecurringMatch(req.params.id as string, transactionId, yearMonth));
}));

router.post('/candidates/defer', asyncHandler(async (req: Request, res: Response) => {
  if (!req.body?.vendor) throw new BadRequestError('Vendor is required');
  await deferRecurringCandidate(req.body.vendor);
  res.json({ success: true });
}));

router.post('/candidates/ignore', asyncHandler(async (req: Request, res: Response) => {
  if (!req.body?.vendor) throw new BadRequestError('Vendor is required');
  await ignoreRecurringCandidate(req.body.vendor);
  res.json({ success: true });
}));

router.get('/candidates/ignored', asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getIgnoredRecurringCandidates());
}));

router.delete('/candidates/ignored/:vendorKey', asyncHandler(async (req: Request, res: Response) => {
  await restoreIgnoredRecurringCandidate(decodeURIComponent(req.params.vendorKey as string));
  res.json({ success: true });
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  res.json(await updateRecurringTransaction(req.params.id as string, validateRecurringInput(req.body, true) as Parameters<typeof updateRecurringTransaction>[1]));
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await deleteRecurringTransaction(req.params.id as string);
  res.json({ success: true });
}));

export default router;
