import { Router } from 'express';
import { 
  getCategoryRules, 
  addCategoryRule, 
  deleteCategoryRule 
} from '../services/categoryService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rules = await getCategoryRules();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { keyword, assigned_category } = req.body;
    const rule = await addCategoryRule(keyword, assigned_category);
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteCategoryRule(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
