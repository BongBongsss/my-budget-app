import { Router } from 'express';
import { 
  getCategoryRules, 
  addCategoryRule, 
  deleteCategoryRule,
  updateCategoryRule
} from '../services/categoryService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const rules = await getCategoryRules();
  res.json(rules);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { keyword, assigned_category } = req.body;
  if (!keyword || !assigned_category) {
    throw new BadRequestError('Keyword and assigned_category are required');
  }
  const rule = await addCategoryRule(keyword, assigned_category);
  res.status(201).json(rule);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { keyword, assigned_category } = req.body;
  if (!keyword || !assigned_category) {
    throw new BadRequestError('Keyword and assigned_category are required');
  }
  await updateCategoryRule(req.params.id, keyword, assigned_category);
  res.json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await deleteCategoryRule(req.params.id);
  res.json({ success: true });
}));

export default router;
