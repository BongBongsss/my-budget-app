import { Router } from 'express';
import { getIgnoredRules, ignoreRule, unignoreRule } from '../services/ignoredRuleService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const rules = await getIgnoredRules();
  res.json(rules);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) {
    throw new BadRequestError('Keyword is required');
  }
  await ignoreRule(keyword);
  res.status(201).json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await unignoreRule(req.params.id);
  res.json({ success: true });
}));

export default router;
