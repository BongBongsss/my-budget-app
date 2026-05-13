import { Router, Request, Response } from 'express';
import { 
  getAllRecurringTransactions, 
  addRecurringTransaction, 
  deleteRecurringTransaction 
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

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await deleteRecurringTransaction(req.params.id as string);
  res.json({ success: true });
}));

export default router;
