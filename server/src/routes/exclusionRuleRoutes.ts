import { Router } from 'express';
import { getExclusionRules, addExclusionRule, deleteExclusionRule } from '../services/exclusionRuleService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rules = await getExclusionRules();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exclusion rules' });
  }
});

router.post('/', async (req, res) => {
  const { keyword } = req.body;
  try {
    const rule = await addExclusionRule(keyword);
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add exclusion rule' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteExclusionRule(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete exclusion rule' });
  }
});

export default router;
