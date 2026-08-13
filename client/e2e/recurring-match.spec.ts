import { expect, test } from '@playwright/test';

test('admin can review and manually confirm a fixed-cost match', async ({ page }) => {
  let authenticated = false;
  let confirmedPayload: Record<string, string> | undefined;
  let matchConfirmed = false;

  const recurring = () => ([{
    id: 'recurring-bus', vendor: '모바일_버스', amount: 9357, category: '교통비', type: 'expense', day_of_month: 2,
    member: '효', isActive: true, isVariable: true, memo: '교통비', matchYearMonth: '2026-07',
    matchStatus: matchConfirmed ? 'confirmed' : 'review_required', matchScore: 70,
    matchReasons: ['거래처 일치', '결제일 일치', '구성원 일치', '카테고리 일치'],
    matchCandidates: matchConfirmed ? [] : [{
      id: 'transaction-bus', date: '2026-07-02', vendor: '모바일_버스', amount: 29300, category: '교통비', score: 70,
      reasons: ['거래처 일치', '결제일 일치', '구성원 일치', '카테고리 일치'],
    }],
  }]);

  await page.route('**/api/auth-status', async (route) => {
    if (!authenticated) return route.fulfill({ status: 401, body: '{}' });
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ role: 'admin' }) });
  });
  await page.route('**/api/login', async (route) => {
    authenticated = true;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ role: 'admin' }) });
  });
  await page.route('**/api/transactions', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify([
    { id: 'transaction-bus', date: '2026-07-02', time: null, type: 'expense', category: '교통비', subcategory: null, vendor: '모바일_버스', amount: 29300, member: '효', isVerified: true, isDeleted: false },
  ]) }));
  await page.route('**/api/categories', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify([{ id: 'transport', name: '교통비', groupName: '생활비' }]) }));
  await page.route('**/api/assets', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.route('**/api/notices**', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.route('**/api/suggestions/candidates', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.route('**/api/recurring**', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(recurring()) }));
  await page.route('**/api/recurring/candidates', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.route('**/api/recurring/recurring-bus/confirm-match', async (route) => {
    confirmedPayload = JSON.parse(route.request().postData() || '{}');
    matchConfirmed = true;
    await route.fulfill({ status: 201, contentType: 'application/json', body: '{}' });
  });

  await page.goto('/');
  await page.locator('select').selectOption('admin');
  await page.locator('input[type="password"]').fill('test-password');
  await page.locator('button[type="submit"]').click();
  await page.getByRole('button', { name: /고정비 관리/ }).click();

  await expect(page.getByText('모바일_버스', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '확인 필요' }).click();
  await expect(page.getByText('07-02 · 모바일_버스')).toBeVisible();
  await page.getByRole('button', { name: '이 거래로 확인' }).click();

  await expect.poll(() => confirmedPayload).toEqual({ transactionId: 'transaction-bus', yearMonth: '2026-07' });
  await expect(page.getByText('수동 매칭 완료')).toBeVisible();
});
