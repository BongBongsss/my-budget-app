import { Request, Response, Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';
import { isMakeReportAuthorized } from '../security/makeReportAuth';
import { formatMonthlyMail } from '../services/monthlyMailReport';
import { getMonthlyMailReport } from '../services/monthlyMailReportRepository';

const router = Router();
router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!isMakeReportAuthorized(process.env.MAKE_REPORT_TOKEN, req.get('authorization'))) return res.status(401).json({ message: 'Unauthorized' });
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  return next();
});
router.get('/monthly-report', asyncHandler(async (req: Request, res: Response) => {
  if (typeof req.query.period !== 'string') throw new BadRequestError('A YYYY-MM period is required.', 'INVALID_REPORT_PERIOD');
  const report = await getMonthlyMailReport(req.query.period);
  res.json(formatMonthlyMail(report));
}));
export default router;
