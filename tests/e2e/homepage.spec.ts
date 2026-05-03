/**
 * E2E 测试 - 首页
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display homepage for each framework', async ({ page }) => {
    // Next.js
    await page.goto('/next/');
    await expect(page).toHaveURL(/\/next\/$/);
    await expect(page.locator('body')).toBeVisible();

    // Nuxt
    await page.goto('/nuxt/');
    await expect(page).toHaveURL(/\/nuxt\/$/);

    // SvelteKit
    await page.goto('/svelte/');
    await expect(page).toHaveURL(/\/svelte\/$/);

    // Astro
    await page.goto('/astro/');
    await expect(page).toHaveURL(/\/astro\/$/);

    // SolidStart
    await page.goto('/solid/');
    await expect(page).toHaveURL(/\/solid\/$/);
  });

  test('should navigate to admin page', async ({ page }) => {
    await page.goto('/next/');

    // 查找管理后台链接并点击
    const adminLink = page.locator('a[href*="/admin"]');
    if (await adminLink.isVisible()) {
      await adminLink.click();
      await expect(page).toHaveURL(/\/admin/);
    }
  });
});
