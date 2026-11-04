import { expect, test, type Page } from '@playwright/test';

const transaction = {
  id: 'edit-transaction', date: '2026-11-04', time: '10:00', type: 'expense', category: '식비',
  vendor: '편집 테스트 거래', amount: 12000, source: '카드', memo: '기존 메모', member: '효',
  isVerified: true, isDuplicate: false, reviewTargetType: 'transaction',
};

async function setup(page: Page) {
  const state = { authenticated: false, role: 'admin', failure: '' as '' | 'server' | 'network' | 'expired' | 'forbidden' | 'lost-response', saves: 0, row: { ...transaction }, holdSave: false, releaseSave: (() => {}) as () => void };
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api', '');
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (path === '/login') {
      const data = request.postDataJSON();
      if (data.password === 'wrong-password') return json({ message: 'Invalid ID or Password' }, 401);
      state.role = data.username;
      state.authenticated = true;
      return json({ role: state.role });
    }
    if (path === '/logout') { state.authenticated = false; return json({ success: true }); }
    if (path === '/auth-status') return state.authenticated
      ? json({ role: state.role }) : json({ code: 'SESSION_EXPIRED', message: 'Please log in again.' }, 401);
    if (path === '/transactions/edit-transaction' && request.method() === 'PUT') {
      state.saves++;
      if (state.holdSave) await new Promise<void>((resolve) => { state.releaseSave = resolve; });
      if (state.failure === 'expired') { state.authenticated = false; return json({ code: 'SESSION_EXPIRED' }, 401); }
      if (state.failure === 'forbidden') return json({ code: 'FORBIDDEN', message: 'Admin role required' }, 403);
      if (state.failure === 'server') return json({ message: 'Test server error' }, 500);
      if (state.failure === 'network') return route.abort('failed');
      state.row = { ...state.row, ...request.postDataJSON() };
      if (state.failure === 'lost-response') return route.abort('failed');
      return json({ success: true, auditLogIds: [] });
    }
    if (path === '/transactions') return json([state.row]);
    if (path === '/categories') return json([{ id: 'food', name: '식비', groupName: '생활비' }]);
    if (path.includes('auto-categorize')) return json({ category: '기타' });
    if (path === '/chart-statistics-settings') return json({ income: [], expense: [] });
    return json([]);
  });
  await page.goto('/');
  await login(page);
  return state;
}

async function login(page: Page, role = 'admin') {
  const form = page.locator('.login-card');
  await form.locator('select').selectOption(role);
  await form.locator('input[type="password"]').fill('test-password');
  await form.locator('button[type="submit"]').click();
  await expect(form).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1, name: '효굥봉 가계부' })).toBeVisible();
}

async function editMemo(page: Page, mobile: boolean) {
  if (mobile) {
    const card = page.locator('.mobile-transaction-card');
    await card.locator('.mobile-card-vendor').click();
    await card.getByRole('button', { name: '수정', exact: true }).click();
    await card.getByLabel('메모', { exact: true }).fill('보존할 새 메모');
    return card.getByRole('button', { name: '저장', exact: true });
  }
  const row = page.getByRole('table').getByRole('row').filter({ hasText: transaction.vendor });
  await row.getByTitle('수정', { exact: true }).click();
  await page.getByRole('table').locator('tbody tr input[type="text"]').last().fill('보존할 새 메모');
  return page.getByRole('button', { name: '거래 수정 저장', exact: true });
}

for (const mobile of [false, true]) {
  test.describe(mobile ? 'mobile recovery' : 'desktop recovery', () => {
    test.use({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 } });

    test('keeps the edit on failure and permits a successful retry', async ({ page }) => {
      const state = await setup(page);
      state.failure = 'server';
      const save = await editMemo(page, mobile);
      await save.click();
      await expect(page.getByRole('alert')).toContainText('입력 내용은 유지');
      await expect(save).toBeEnabled();
      expect(state.saves).toBe(1);
      state.failure = '';
      await save.click();
      await expect(page.getByRole('alert')).toHaveCount(0);
      await expect(mobile ? page.locator('.mobile-card-note') : page.getByRole('table')).toContainText('보존할 새 메모');
      expect(state.row.memo).toBe('보존할 새 메모');
    });

    test('preserves the draft across expiry and reauthentication without auto-saving', async ({ page }) => {
      const state = await setup(page);
      const save = await editMemo(page, mobile);
      state.failure = 'expired';
      await save.click();
      await expect(page.locator('.login-card')).toBeVisible();
      await expect(page.getByText(/로그인이 만료되었습니다/)).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).not.toBeVisible();
      state.failure = '';
      await login(page);
      expect(state.saves).toBe(1);
      const memo = mobile ? page.locator('.mobile-transaction-card').getByLabel('메모', { exact: true })
        : page.getByRole('table').locator('tbody tr input[type="text"]').last();
      await expect(memo).toHaveValue('보존할 새 메모');
      await save.click();
      await expect(save).toHaveCount(0);
      expect(state.row.memo).toBe('보존할 새 메모');
    });
  });
}

test('does not treat a forbidden action as a session expiry', async ({ page }) => {
  const state = await setup(page);
  state.failure = 'forbidden';
  await (await editMemo(page, false)).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('.login-card')).toHaveCount(0);
});

test('retains the edit during a network outage without logging out', async ({ page }) => {
  const state = await setup(page);
  state.failure = 'network';
  const save = await editMemo(page, false);
  await save.click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('.login-card')).toHaveCount(0);
  await expect(page.getByRole('table').locator('tbody tr input[type="text"]').last()).toHaveValue('보존할 새 메모');
});

test('blocks repeat saves while the first request is pending', async ({ page }) => {
  const state = await setup(page);
  state.holdSave = true;
  const save = await editMemo(page, false);
  await save.click();
  await expect(save).toBeDisabled();
  await save.dispatchEvent('click');
  await expect.poll(() => state.saves).toBe(1);
  state.releaseSave();
  await expect(save).toHaveCount(0);
});

test('keeps a new transaction form during reauthentication', async ({ page }) => {
  const state = await setup(page);
  await page.getByRole('button', { name: '거래 입력', exact: true }).first().click();
  const form = page.getByRole('dialog', { name: '거래 입력', exact: true });
  await form.locator('input[type="text"]').nth(1).fill('재로그인 후 입력 유지');
  await form.locator('input[type="number"]').fill('5000');
  let creates = 0;
  await page.route('**/api/transactions', async (route) => {
    if (route.request().method() === 'POST') {
      creates++;
      state.authenticated = false;
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'SESSION_EXPIRED' }) });
    }
    return route.fallback();
  });
  await form.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page.locator('.login-card')).toBeVisible();
  await expect(form).not.toBeVisible();
  await login(page);
  await expect(form.locator('input[type="text"]').nth(1)).toHaveValue('재로그인 후 입력 유지');
  await expect(form.locator('input[type="number"]')).toHaveValue('5000');
  expect(creates).toBe(1);
});

test('hides a notice portal while the expired session login screen is shown', async ({ page }) => {
  const state = await setup(page);
  state.holdSave = true;
  await (await editMemo(page, false)).click();
  await expect.poll(() => state.saves).toBe(1);
  if (!await page.getByRole('button', { name: '공지', exact: true }).isVisible()) {
    await page.getByRole('button', { name: '메뉴 열기', exact: true }).click();
  }
  await page.getByRole('button', { name: '공지', exact: true }).click();
  await expect(page.locator('.notice-list-modal')).toBeVisible();
  state.failure = 'expired';
  state.releaseSave();
  await expect(page.locator('.login-card')).toBeVisible();
  await expect(page.locator('.notice-list-modal')).toHaveCount(0);
});

test('retains the draft after a lost response and refreshes the saved server state', async ({ page }) => {
  const state = await setup(page);
  state.failure = 'lost-response';
  await (await editMemo(page, false)).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('table').locator('tbody tr input[type="text"]').last()).toHaveValue('보존할 새 메모');
  expect(state.row.memo).toBe('보존할 새 메모');
  expect(state.saves).toBe(1);
});

test('discards the previous editor when reauthenticating as a different role', async ({ page }) => {
  const state = await setup(page);
  state.failure = 'expired';
  await (await editMemo(page, false)).click();
  await expect(page.locator('.login-card')).toBeVisible();
  await login(page, 'viewer');
  await expect(page.getByRole('button', { name: '거래 수정 저장' })).toHaveCount(0);
  await expect(page.getByText('보존할 새 메모', { exact: true })).toHaveCount(0);
});

test('does not retain editor state after an explicit logout', async ({ page }) => {
  await setup(page);
  await editMemo(page, false);
  if (!await page.getByRole('button', { name: '로그아웃', exact: true }).isVisible()) {
    await page.getByRole('button', { name: '메뉴 열기', exact: true }).click();
  }
  await page.getByRole('button', { name: '로그아웃', exact: true }).click();
  await expect(page.locator('.login-card')).toBeVisible();
  await login(page);
  await expect(page.getByRole('button', { name: '거래 수정 저장' })).toHaveCount(0);
});
