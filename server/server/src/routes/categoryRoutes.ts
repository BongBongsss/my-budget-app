import { Router } from 'express';
import prisma from '../db';
import { randomUUID } from 'crypto';
import { autoCategorize } from '../services/categoryService';

const router = Router();

// 실시간 자동 지정 API
router.get('/auto', async (req, res) => {
  try {
    const { vendor } = req.query;
    if (!vendor) return res.json({ category: '기타' });
    const category = await autoCategorize(vendor as string);
    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    
    const category = await prisma.category.create({
      data: {
        id: randomUUID(),
        name,
      },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 카테고리 그룹 일괄 업데이트
router.post('/batch-group', async (req, res) => {
  try {
    const { categoryIds, groupName } = req.body;
    if (!Array.isArray(categoryIds) || !groupName) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    await prisma.category.updateMany({
      where: { id: { in: categoryIds } },
      data: { groupName }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
