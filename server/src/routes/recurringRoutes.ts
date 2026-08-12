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

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const recurring = await getAllRecurringTransactions();
  res.json(recurring);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { vendor, amount, category, day_of_month } = req.body;
  if (!vendor || amount === undefined || !category || day_of_month === undefined) {
    throw new BadRequestError('Vendor, amount, category, and day_of_month are required');
  }
  const recurring = await addRecurringTransaction(req.body);
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
  res.json(await updateRecurringTransaction(req.params.id as string, req.body));
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await deleteRecurringTransaction(req.params.id as string);
  res.json({ success: true });
}));

export default router;
