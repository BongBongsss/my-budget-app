import { Router, Request, Response } from 'express';
import multer from 'multer';
import { 
  getAllTransactions, 
  addTransaction, 
  updateTransaction, 
  bulkUpdateTransactions,
  deleteTransaction,
  bulkAddTransactions,
  stageImportRows,
  applyAutoRulesToExisting,
  verifyTransactions,
  cleanupTransactions,
  bulkDeleteTransactions,
  exportTransactionsBackup
} from '../services/transactionService';
import { getImportFileFormat, parseCSVForImport, parseExcelForImport } from '../services/importService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

const router = Router();
const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMPORT_FILE_SIZE_BYTES,
    files: 1,
    fields: 10,
  },
});

const getAuditActor = (req: Request) => ({
  role: req.session?.role,
  ipAddress: req.ip,
});

const requireAdmin = (req: Request) => {
  if (req.session?.role !== 'admin') {
    throw new UnauthorizedError('Admin role required');
  }
};

router.post('/cleanup', asyncHandler(async (req: Request, res: Response) => {
  const result = await cleanupTransactions(getAuditActor(req));
  res.json({ success: true, ...result });
}));

router.post('/verify', asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    throw new BadRequestError('Expected an array of IDs');
  }
  const result = await verifyTransactions(ids, getAuditActor(req));
  res.json({ success: true, count: result.count });
}));

router.post('/apply-rules', asyncHandler(async (req: Request, res: Response) => {
  const result = await applyAutoRulesToExisting(getAuditActor(req));
  res.json({ success: true, ...result });
}));

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const transactions = await getAllTransactions();
  res.json(transactions);
}));

router.get('/export', asyncHandler(async (req: Request, res: Response) => {
  requireAdmin(req);
  const backup = await exportTransactionsBackup();
  const date = new Date().toISOString().slice(0, 10);
  const filename = `transactions-backup-${date}.json`;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json(backup);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const transaction = await addTransaction(req.body, getAuditActor(req));
  res.status(201).json(transaction);
}));

router.post('/import', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new BadRequestError('No file uploaded');
  }

  const buffer = req.file.buffer;
  const fileFormat = getImportFileFormat(req.file.originalname);
  let rows;

  if (fileFormat === 'csv') {
    rows = parseCSVForImport(buffer);
  } else if (fileFormat === 'xlsx') {
    rows = await parseExcelForImport(buffer);
  } else if (fileFormat === 'legacy-xls') {
    throw new BadRequestError('Legacy .xls files are not supported. Save the file as .xlsx or CSV UTF-8 and try again.');
  } else {
    throw new BadRequestError('Unsupported file format');
  }

  const summary = await stageImportRows(rows, req.file.originalname, getAuditActor(req));
  const results = await getAllTransactions();
  res.status(201).json({ success: true, summary, transactions: results });
}));

router.post('/bulk', asyncHandler(async (req: Request, res: Response) => {
  const transactions = req.body;
  if (!Array.isArray(transactions)) {
    throw new BadRequestError('Expected an array of transactions');
  }
  await bulkAddTransactions(transactions, getAuditActor(req));
  const results = await getAllTransactions();
  res.status(201).json(results);
}));

router.post('/bulk-update', asyncHandler(async (req: Request, res: Response) => {
  const { ids, updates } = req.body;
  if (!Array.isArray(ids)) {
    throw new BadRequestError('Expected an array of IDs');
  }
  if (!updates || typeof updates !== 'object') {
    throw new BadRequestError('Expected updates object');
  }
  const result = await bulkUpdateTransactions(ids, updates, getAuditActor(req));
  res.json({ success: true, count: result.count, auditLogIds: result.auditLogIds });
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const result = await updateTransaction(req.params.id as string, req.body, getAuditActor(req));
  res.json({ success: true, auditLogIds: result.auditLogIds });
}));

router.delete('/bulk', asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    throw new BadRequestError('Expected an array of IDs');
  }
  const result = await bulkDeleteTransactions(ids, getAuditActor(req));
  res.json({ success: true, count: result.count, auditLogIds: result.auditLogIds });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteTransaction(req.params.id as string, getAuditActor(req));
  res.json({ success: true, auditLogIds: result.auditLogIds });
}));

export default router;
