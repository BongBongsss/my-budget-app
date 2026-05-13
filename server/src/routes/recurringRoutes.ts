import { Router } from 'express';
import { 
  getAllRecurringTransactions, 
  addRecurringTransaction, 
  deleteRecurringTransaction 
} from '../services/recurringService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const recurring = await getAllRecurringTransactions();
  res.json(recurring);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { vendor, amount, category, day_of_month } = req.body;
  if (!vendor || amount === undefined || !category || day_of_month === undefined) {
    throw new BadRequestError('Vendor, amount, category, and day_of_month are required');
  }
  const recurring = await addRecurringTransaction(req.body);
  res.status(201).json(recurring);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await deleteRecurringTransaction(req.params.id);
  res.json({ success: true });
}));

export default router;
