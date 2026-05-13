import { Router } from 'express';
import { getExclusionRules, addExclusionRule, deleteExclusionRule } from '../services/exclusionRuleService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const rules = await getExclusionRules();
  res.json(rules);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) {
    throw new BadRequestError('Keyword is required');
  }
  const rule = await addExclusionRule(keyword);
  res.status(201).json(rule);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await deleteExclusionRule(req.params.id);
  res.json({ success: true });
}));

export default router;
