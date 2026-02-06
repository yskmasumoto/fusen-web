import { test, expect } from '@playwright/test';

test('note follows drag without offset drift', async ({ page }) => {
  await page.goto('/');

  const addButton = page.getByRole('button', { name: '付箋を追加' });
  await addButton.click();

  const note = page.locator('.note').first();
  await expect(note).toBeVisible();

  const header = note.locator('.note-header');
  const initial = await note.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      left: Number.parseFloat(style.left || '0'),
      top: Number.parseFloat(style.top || '0'),
    };
  });

  const box = await header.boundingBox();
  if (!box) {
    throw new Error('note header bounding box not found');
  }

  const startX = box.x + 40;
  const startY = box.y + 16;
  const deltaX = 120;
  const deltaY = 80;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + deltaX, startY + deltaY);
  await page.mouse.up();

  const moved = await note.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      left: Number.parseFloat(style.left || '0'),
      top: Number.parseFloat(style.top || '0'),
    };
  });

  expect(moved.left - initial.left).toBeCloseTo(deltaX, 0);
  expect(moved.top - initial.top).toBeCloseTo(deltaY, 0);
});
