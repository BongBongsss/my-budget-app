import { Router, Request, Response } from 'express';
import * as assetService from '../services/assetService';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

const getAuditActor = (req: Request) => ({
  role: req.session?.role,
  ipAddress: req.ip,
});

router.get('/history', asyncHandler(async (req: Request, res: Response) => {
  const history = await assetService.getAssetHistory();
  res.json(history);
}));

router.post('/history/save', asyncHandler(async (req: Request, res: Response) => {
  await assetService.saveAssetHistory();
  res.json({ success: true });
}));

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const assets = await assetService.getAllAssets();
  res.json(assets);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.addAsset(req.body, getAuditActor(req));
  res.json(asset);
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.updateAsset(req.params.id as string, req.body, getAuditActor(req));
  res.json(asset);
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await assetService.deleteAsset(req.params.id as string, getAuditActor(req));
  res.json({ success: true });
}));

export default router;
