import { Router } from 'express';
import { 
  getCategoryRules, 
  addCategoryRule, 
  deleteCategoryRule 
} from '../services/categoryService';

const router = Router();

router.get('/', (req, res) => {
  try {
    const rules = getCategoryRules();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', (req, res) => {
  try {
    const { keyword, assigned_category } = req.body;
    const rule = addCategoryRule(keyword, assigned_category);
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    deleteCategoryRule(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
