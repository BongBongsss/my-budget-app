import { expect, test, type Page } from '@playwright/test';

type TestTransaction = {
  id: string;
  date: string;
  time: string;
  type: 'income' | 'expense';
  category: string;
  subcategory: string | null;
  vendor: string;
  amount: number;
  currency: string;
  source: string;
  memo: string | null;
  member: string;
  isVerified: boolean;
  isDuplicate: boolean;
  isInvalid: boolean;
  isDeleted: boolean;
  importStatus?: 'new' | 'duplicate' | 'invalid';
  reviewTargetType?: 'transaction' | 'importRow';
};

const loginAsAdmin = async (page: Page) => {
  let authenticated = false;

  await page.route('**/api/auth-status', async (route) => {
    if (!authenticated) {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Not authenticated' }) });
      return;
    }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ role: 'admin' }) });
  });
  await page.route('**/api/login', async (route) => {
    authenticated = true;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ role: 'admin' }) });
  });
  await page.route('**/api/categories', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.route('**/api/assets', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.route('**/api/notices**', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.route('**/api/suggestions/candidates', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.route('**/api/review-requests**', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));

  await page.goto('/');
  await page.locator('select').selectOption('admin');
  await page.locator('input[type="password"]').fill('test-password');
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole('button', { name: 'LogOut' })).toBeVisible();
};

test('admin can undo a deleted transaction without creating a duplicate', async ({ page }) => {
  const transaction: TestTransaction = {
    id: 'transaction-1', date: '2026-08-05', time: '09:00', type: 'expense', category: '식비', subcategory: null,
    vendor: '테스트 삭제 거래', amount: 12000, currency: 'KRW', source: 'manual', memo: null, member: '효',
    isVerified: true, isDuplicate: false, isInvalid: false, isDeleted: false,
  };
  let transactions = [transaction];
  let restoreRequestIds: string[] = [];

  await page.route('**/api/transactions', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(transactions) }));
  await page.route('**/api/transactions/transaction-1', async (route) => {
    expect(route.request().method()).toBe('DELETE');
    transactions = [];
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, auditLogIds: ['audit-delete-1'] }) });
  });
  await page.route('**/api/audit-logs/restore', async (route) => {
    restoreRequestIds = JSON.parse(route.request().postData() || '{}').auditLogIds;
    transactions = [transaction];
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, count: 1 }) });
  });

  await loginAsAdmin(page);
  const transactionCell = page.getByRole('table').getByText('테스트 삭제 거래');
  const transactionRow = page.getByRole('table').getByRole('row').filter({ hasText: '테스트 삭제 거래' });
  await expect(transactionCell).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await transactionRow.getByTitle('삭제', { exact: true }).click();
  await expect(transactionCell).toHaveCount(0);

  await page.getByRole('button', { name: '직전 작업 일괄 되돌리기' }).click();
  await expect(transactionCell).toBeVisible();
  expect(restoreRequestIds).toEqual(['audit-delete-1']);
});

test('admin can confirm an imported candidate and move it to confirmed transactions', async ({ page }) => {
  const candidate: TestTransaction = {
    id: 'import-row-1', date: '2026-08-05', time: '10:00', type: 'expense', category: '식비', subcategory: null,
    vendor: '테스트 Import 후보', amount: 25000, currency: 'KRW', source: 'file_import', memo: null, member: '공',
    isVerified: false, isDuplicate: false, isInvalid: false, isDeleted: false, importStatus: 'new', reviewTargetType: 'importRow',
  };
  const confirmed: TestTransaction = { ...candidate, id: 'transaction-confirmed-1', isVerified: true, importStatus: undefined };
  let transactions: TestTransaction[] = [];
  let verifiedIds: string[] = [];

  await page.route('**/api/transactions', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(transactions) }));
  await page.route('**/api/transactions/import', async (route) => {
    expect(route.request().method()).toBe('POST');
    transactions = [candidate];
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        summary: { total: 1, newCount: 1, duplicateCount: 0, invalidCount: 0, replaced: { total: 0, newCount: 0, duplicateCount: 0, invalidCount: 0 } },
        transactions,
      }),
    });
  });
  await page.route('**/api/transactions/verify', async (route) => {
    verifiedIds = JSON.parse(route.request().postData() || '{}').ids;
    transactions = [confirmed];
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, count: 1 }) });
  });

  await loginAsAdmin(page);
  await page.locator('input[type="file"]').setInputFiles({
    name: 'transactions.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('date,time,vendor,amount\n2026-08-05,10:00,테스트 Import 후보,25000\n'),
  });

  await expect(page.locator('.import-result-modal')).toBeVisible();
  await page.locator('.import-result-modal button').click();
  const candidateCell = page.getByRole('table').getByText('테스트 Import 후보');
  const candidateRow = page.getByRole('table').getByRole('row').filter({ hasText: '테스트 Import 후보' });
  await expect(candidateCell).toBeVisible();

  await candidateRow.getByTitle('승인', { exact: true }).click();
  await expect.poll(() => verifiedIds).toEqual(['import-row-1']);
  await expect(candidateCell).toBeVisible();
});
