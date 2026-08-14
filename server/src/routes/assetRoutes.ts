import { Router, Request, Response } from 'express';
import * as assetService from '../services/assetService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();

const getAuditActor = (req: Request) => ({
  role: req.session?.role,
  ipAddress: req.ip,
});

const validateAssetInput = (body: Record<string, unknown>, partial = false) => {
  const data = { ...body } as Record<string, unknown>;
  const has = (key: string) => data[key] !== undefined;

  if (!partial || has('name')) {
    if (typeof data.name !== 'string' || !data.name.trim()) throw new BadRequestError('자산 이름은 필수입니다.');
    data.name = data.name.trim();
  }
  if (!partial || has('type')) {
    if (typeof data.type !== 'string' || !data.type.trim()) throw new BadRequestError('자산 유형은 필수입니다.');
    data.type = data.type.trim();
  }
  if (!partial || has('balance')) {
    const balance = Number(data.balance);
    if (!Number.isFinite(balance)) throw new BadRequestError('현재 잔액은 숫자로 입력해 주세요.');
    data.balance = balance;
  }
  if (!partial || has('member')) {
    if (typeof data.member !== 'string' || !data.member.trim()) throw new BadRequestError('구성원은 필수입니다.');
    data.member = data.member.trim();
  }
  if (has('memo') && typeof data.memo === 'string') data.memo = data.memo.trim();
  return data;
};

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
  const asset = await assetService.addAsset(validateAssetInput(req.body), getAuditActor(req));
  res.json(asset);
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.updateAsset(req.params.id as string, validateAssetInput(req.body, true), getAuditActor(req));
  res.json(asset);
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await assetService.deleteAsset(req.params.id as string, getAuditActor(req));
  res.json({ success: true });
}));

export default router;
