import { Router, Request, Response } from 'express';
import * as assetTypeService from '../services/assetTypeService';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.get('/', asyncHandler(async (_req: Request, res: Response) => res.json(await assetTypeService.getAssetTypes())));
router.post('/', asyncHandler(async (req: Request, res: Response) => res.status(201).json(await assetTypeService.addAssetType(req.body.name, req.body.isLiability))));
router.put('/:id', asyncHandler(async (req: Request, res: Response) => res.json(await assetTypeService.updateAssetType(req.params.id as string, req.body.name, req.body.isLiability))));
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => { await assetTypeService.deleteAssetType(req.params.id as string); res.json({ success: true }); }));
export default router;
