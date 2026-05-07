import { Router } from 'express';
import { getRuleCandidates } from '../services/suggestionService';
import { addCategoryRule } from '../services/categoryService';

const router = Router();

// 추천 규칙 목록 조회
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await getRuleCandidates();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rule candidates' });
  }
});

// 추천 규칙 승인 (실제 규칙으로 등록)
router.post('/approve', async (req, res) => {
  const { vendor, category } = req.body;
  try {
    const newRule = await addCategoryRule(vendor, category);
    res.json(newRule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve rule' });
  }
});

export default router;
