import { Router, Request, Response } from 'express';
import { getPaymentRules, addPaymentRule, deletePaymentRule, applyPaymentRulesToExisting } from '../services/paymentService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const rules = await getPaymentRules();
  res.json(rules);
}));

router.post('/apply', asyncHandler(async (req: Request, res: Response) => {
  const count = await applyPaymentRulesToExisting();
  res.json({ success: true, updatedCount: count });
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { paymentType, keyword } = req.body;
  if (!paymentType || !keyword) {
    throw new BadRequestError('PaymentType and keyword are required');
  }
  const rule = await addPaymentRule(paymentType, keyword);
  res.status(201).json(rule);
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await deletePaymentRule(req.params.id as string);
  res.json({ success: true });
}));

export default router;
