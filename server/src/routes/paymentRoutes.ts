import { Router } from 'express';
import { getPaymentRules, addPaymentRule, deletePaymentRule } from '../services/paymentService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rules = await getPaymentRules();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { paymentType, keyword } = req.body;
    const rule = await addPaymentRule(paymentType, keyword);
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deletePaymentRule(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
