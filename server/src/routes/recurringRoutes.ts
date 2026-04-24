import { Router } from 'express';
import db from '../db';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', (req, res) => {
  try {
    const recurring = db.prepare('SELECT * FROM recurring_transactions').all();
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', (req, res) => {
  try {
    const { vendor, amount, category, day_of_month } = req.body;
    const id = randomUUID();
    db.prepare('INSERT INTO recurring_transactions (id, vendor, amount, category, day_of_month) VALUES (?, ?, ?, ?, ?)')
      .run(id, vendor, amount, category, day_of_month);
    res.status(201).json({ id, vendor, amount, category, day_of_month });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM recurring_transactions WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
