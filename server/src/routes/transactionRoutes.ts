import { Router } from 'express';
import multer from 'multer';
import { 
  getAllTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction,
  bulkAddTransactions as bulkSaveTransactions // Renamed for clarity
} from '../services/transactionService';
import { parseCSV, parseExcel } from '../services/importService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', (req, res) => {
  try {
    const transactions = getAllTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', (req, res) => {
  try {
    const transaction = addTransaction(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/import', upload.single('file'), (req, res) => {
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
    
    // *** FIX: Save parsed transactions to the database ***
    const savedTransactions = bulkSaveTransactions(transactions); 
    // *** END FIX ***

    res.status(201).json(savedTransactions); // Return saved transactions
  } catch (error) {
    // Added error logging for debugging
    console.error('Error during file import:', error);
    res.status(500).json({ error: (error as Error).message || 'Failed to parse or import file' });
  }
});

router.post('/bulk', (req, res) => {
  try {
    const transactions = req.body;
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Expected an array of transactions' });
    }
    // Using bulkSaveTransactions from transactionService
    const results = bulkSaveTransactions(transactions); 
    res.status(201).json(results);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', (req, res) => {
  try {
    updateTransaction(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/bulk', (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Expected an array of IDs' });
    }
    ids.forEach(id => deleteTransaction(id));
    res.json({ success: true, count: ids.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    deleteTransaction(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
