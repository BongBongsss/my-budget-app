import { Router, Request, Response } from 'express';
import { getIgnoredRules, ignoreRule, unignoreRule } from '../services/ignoredRuleService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const rules = await getIgnoredRules();
  res.json(rules);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { keyword } = req.body;
  if (!keyword) {
    throw new BadRequestError('Keyword is required');
  }
  await ignoreRule(keyword);
  res.status(201).json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await unignoreRule(req.params.id as string);
  res.json({ success: true });
}));

export default router;
