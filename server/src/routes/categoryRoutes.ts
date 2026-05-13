import { Router } from 'express';
import * as categoryService from '../services/categoryService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();

// 실시간 자동 지정 API
router.get('/auto', asyncHandler(async (req, res) => {
  const { vendor } = req.query;
  if (!vendor) return res.json({ category: '기타' });
  const category = await categoryService.autoCategorize(vendor as string);
  res.json({ category });
}));

router.get('/', asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.json(categories);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) throw new BadRequestError('Name is required');
  
  const category = await categoryService.createCategory(name);
  res.status(201).json(category);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.json({ success: true });
}));

// 카테고리 그룹 일괄 업데이트
router.post('/batch-group', asyncHandler(async (req, res) => {
  const { categoryIds, groupName } = req.body;
  if (!Array.isArray(categoryIds) || !groupName) {
    throw new BadRequestError('Invalid data: categoryIds must be an array and groupName is required');
  }

  await categoryService.updateCategoryGroup(categoryIds, groupName);
  res.json({ success: true });
}));

export default router;
