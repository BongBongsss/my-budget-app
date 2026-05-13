import { Router, Request, Response } from 'express';
import { getExclusionRules, addExclusionRule, deleteExclusionRule } from '../services/exclusionRuleService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const rules = await getExclusionRules();
  res.json(rules);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { keyword } = req.body;
  if (!keyword) {
    throw new BadRequestError('Keyword is required');
  }
  const rule = await addExclusionRule(keyword);
  res.status(201).json(rule);
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await deleteExclusionRule(req.params.id as string);
  res.json({ success: true });
}));

export default router;
