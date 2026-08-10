import { Router, Request, Response } from 'express';
import { 
  getAllRecurringTransactions, 
  addRecurringTransaction, 
  deleteRecurringTransaction,
  updateRecurringTransaction,
  getRecurringCandidates,
  deferRecurringCandidate,
  ignoreRecurringCandidate,
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

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  res.json(await updateRecurringTransaction(req.params.id as string, req.body));
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await deleteRecurringTransaction(req.params.id as string);
  res.json({ success: true });
}));

export default router;
