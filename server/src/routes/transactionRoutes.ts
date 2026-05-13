import { Router, Request, Response } from 'express';
import multer from 'multer';
import { 
  getAllTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction,
  bulkAddTransactions,
  applyAutoRulesToExisting,
  verifyTransactions,
  cleanupTransactions,
  bulkDeleteTransactions
} from '../services/transactionService';
import { parseCSV, parseExcel } from '../services/importService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/cleanup', asyncHandler(async (req: Request, res: Response) => {
  const result = await cleanupTransactions();
  res.json({ success: true, ...result });
}));

router.post('/verify', asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    throw new BadRequestError('Expected an array of IDs');
  }
  const result = await verifyTransactions(ids);
  res.json({ success: true, count: result.count });
}));

router.post('/apply-rules', asyncHandler(async (req: Request, res: Response) => {
  const count = await applyAutoRulesToExisting();
  res.json({ success: true, count });
}));

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const transactions = await getAllTransactions();
  res.json(transactions);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const transaction = await addTransaction(req.body);
  res.status(201).json(transaction);
}));

router.post('/import', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new BadRequestError('No file uploaded');
  }

  const buffer = req.file.buffer;
  const filename = req.file.originalname.toLowerCase();
  let transactions;

  if (filename.endsWith('.csv')) {
    transactions = parseCSV(buffer);
  } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
    transactions = parseExcel(buffer);
  } else {
    throw new BadRequestError('Unsupported file format');
  }
  
  res.status(200).json(transactions);
}));

router.post('/bulk', asyncHandler(async (req: Request, res: Response) => {
  const transactions = req.body;
  if (!Array.isArray(transactions)) {
    throw new BadRequestError('Expected an array of transactions');
  }
  await bulkAddTransactions(transactions);
  const results = await getAllTransactions();
  res.status(201).json(results);
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  await updateTransaction(req.params.id as string, req.body);
  res.json({ success: true });
}));

router.delete('/bulk', asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    throw new BadRequestError('Expected an array of IDs');
  }
  await bulkDeleteTransactions(ids);
  res.json({ success: true, count: ids.length });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await deleteTransaction(req.params.id as string);
  res.json({ success: true });
}));

export default router;
