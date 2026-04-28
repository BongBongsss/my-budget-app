import { Router } from 'express';
import multer from 'multer';
import { 
  getAllTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction,
  bulkAddTransactions,
  applyAutoRulesToExisting,
  verifyTransactions
} from '../services/transactionService';
import { parseCSV, parseExcel } from '../services/importService';
import prisma from '../db';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/verify', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Expected an array of IDs' });
    }
    const result = await verifyTransactions(ids);
    res.json({ success: true, count: result.count });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/apply-rules', async (req, res) => {
  try {
    const count = await applyAutoRulesToExisting();
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/', async (req, res) => {
  try {
    const transactions = await getAllTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  try {
    const transaction = await addTransaction(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const buffer = req.file.buffer;
    const filename = req.file.originalname.toLowerCase();
    let transactions;

    if (filename.endsWith('.csv')) {
      transactions = parseCSV(buffer);
    } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      transactions = parseExcel(buffer);
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }
    
    await bulkAddTransactions(transactions);
    const savedTransactions = await getAllTransactions();

    res.status(201).json(savedTransactions);
  } catch (error) {
    console.error('Error during file import:', error);
    res.status(500).json({ error: (error as Error).message || 'Failed to parse or import file' });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const transactions = req.body;
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Expected an array of transactions' });
    }
    await bulkAddTransactions(transactions);
    const results = await getAllTransactions();
    res.status(201).json(results);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await updateTransaction(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Expected an array of IDs' });
    }
    await prisma.transaction.deleteMany({
      where: { id: { in: ids } }
    });
    res.json({ success: true, count: ids.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteTransaction(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
