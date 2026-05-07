import { Router } from 'express';
import { getIgnoredRules, ignoreRule, unignoreRule } from '../services/ignoredRuleService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rules = await getIgnoredRules();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ignored rules' });
  }
});

router.post('/', async (req, res) => {
  const { keyword } = req.body;
  try {
    await ignoreRule(keyword);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error in /api/ignored-rules (POST):', error);
    res.status(500).json({ error: 'Failed to ignore rule', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await unignoreRule(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unignore rule' });
  }
});

export default router;
