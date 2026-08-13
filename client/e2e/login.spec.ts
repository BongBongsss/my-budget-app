import { expect, test } from '@playwright/test';

test('viewer can log in and reach the budget dashboard', async ({ page }) => {
  let authenticated = false;
  let loginPayload: { username?: string; rememberMe?: boolean } | undefined;

  await page.route('**/api/auth-status', async (route) => {
    if (!authenticated) {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Not authenticated' }) });
      return;
    }

    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ role: 'viewer' }) });
  });
  await page.route('**/api/login', async (route) => {
    authenticated = true;
    loginPayload = JSON.parse(route.request().postData() || '{}');
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ role: 'viewer' }) });
  });
  await page.route('**/api/transactions', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.route('**/api/categories', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.route('**/api/assets', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: '효굥봉 가계부' })).toBeVisible();

  await page.locator('select').selectOption('viewer');
  await page.getByLabel('자동 로그인').check();
  await page.locator('input[type="password"]').fill('test-password');
  await page.locator('button[type="submit"]').click();

  await expect(page.getByRole('heading', { level: 1, name: '효굥봉 가계부' })).toBeVisible();
  expect(loginPayload).toMatchObject({ username: 'viewer', rememberMe: true });
});
