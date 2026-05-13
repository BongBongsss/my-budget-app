import { Router } from 'express';
import prisma from '../db';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const recurring = await prisma.recurringTransaction.findMany();
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { vendor, amount, category, type, day_of_month } = req.body;
    const recurring = await prisma.recurringTransaction.create({
      data: {
        id: randomUUID(),
        vendor,
        amount,
        category,
        type: type || 'expense',
        day_of_month,
      },
    });
    res.status(201).json(recurring);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.recurringTransaction.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
