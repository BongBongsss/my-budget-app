import { Router } from 'express';
import * as assetService from '../services/assetService';
import prisma from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const assets = await assetService.getAllAssets();
    res.json(assets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const history = await prisma.assetHistory.findMany({
      orderBy: { yearMonth: 'asc' },
    });
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/history/save', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany();
    const totalAssets = assets.reduce((sum, a) => a.type !== 'liability' ? sum + a.balance : sum, 0);
    const totalLiabilities = assets.reduce((sum, a) => a.type === 'liability' ? sum + a.balance : sum, 0);
    const netAssets = totalAssets - totalLiabilities;
    const yearMonth = new Date().toISOString().substring(0, 7);

    await prisma.assetHistory.upsert({
      where: { yearMonth },
      update: { totalAssets, totalLiabilities, netAssets },
      create: { yearMonth, totalAssets, totalLiabilities, netAssets },
    });
    res.json({ success: true });
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
