import { Router } from 'express';
import { getRuleCandidates } from '../services/suggestionService';
import { addCategoryRule } from '../services/categoryService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();

// 추천 규칙 목록 조회
router.get('/candidates', asyncHandler(async (req, res) => {
  const candidates = await getRuleCandidates();
  res.json(candidates);
}));

// 추천 규칙 승인 (실제 규칙으로 등록)
router.post('/approve', asyncHandler(async (req, res) => {
  const { vendor, category } = req.body;
  if (!vendor || !category) {
    throw new BadRequestError('Vendor and category are required');
  }
  const newRule = await addCategoryRule(vendor, category);
  res.json(newRule);
}));

export default router;
