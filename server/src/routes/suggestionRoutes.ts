import { Router, Request, Response } from 'express';
import { approveRuleCandidate, getRuleCandidates, getRuleReviewCandidates } from '../services/suggestionService';
import { deferRuleSuggestion } from '../services/suggestionDeferralService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();

// 추천 규칙 목록 조회
router.get('/candidates', asyncHandler(async (req: Request, res: Response) => {
  const candidates = await getRuleCandidates();
  res.json(candidates);
}));

// 추천 규칙 승인 (실제 규칙으로 등록)
router.post('/approve', asyncHandler(async (req: Request, res: Response) => {
  const { vendor, category } = req.body;
  if (!vendor || !category || typeof vendor !== 'string' || typeof category !== 'string') {
    throw new BadRequestError('Vendor and category are required');
  }
  const newRule = await approveRuleCandidate(vendor, category);
  res.json(newRule);
}));

router.get('/rule-reviews', asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getRuleReviewCandidates());
}));

router.post('/defer', asyncHandler(async (req: Request, res: Response) => {
  const { vendor } = req.body;
  if (!vendor || typeof vendor !== 'string') {
    throw new BadRequestError('Vendor is required');
  }
  await deferRuleSuggestion(vendor);
  res.json({ success: true });
}));

export default router;
