import { Router } from 'express';
import * as assetService from '../services/assetService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const assets = await assetService.getAllAssets();
    res.json(assets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const asset = await assetService.addAsset(req.body);
    res.json(asset);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const asset = await assetService.updateAsset(req.params.id, req.body);
    res.json(asset);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await assetService.deleteAsset(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
