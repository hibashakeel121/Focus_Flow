import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

// Run against the real app after starting MongoDB and both development servers.
const baseURL = process.env.APP_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const createdTaskIds = [];
const outputDirectory = new URL('../submission/screenshots/', import.meta.url);
await mkdir(outputDirectory, { recursive: true });

try {
  await page.goto(baseURL);
  const health = await page.request.get(`${baseURL}/api/health`);
  if (!health.ok()) throw new Error('Start MongoDB and the backend before capturing screenshots.');
  await expect(page.getByRole('heading', { name: 'Focus Flow', exact: true }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Task', exact: true })).toBeEnabled();
  const initialTasks = await (await page.request.get(`${baseURL}/api/tasks`)).json();
  if (initialTasks.length === 0) {
    await expect(page.getByText('No tasks available. Add your first task above.')).toBeVisible();
    await page.screenshot({ path: fileURLToPath(new URL('01-empty-state.png', outputDirectory)), fullPage: true });
  }

  const titles = ['Finish the React assignment', 'Revise MongoDB CRUD operations', 'Prepare for the science quiz'];
  for (const title of titles) {
    await page.getByLabel('Task title', { exact: true }).fill(title);
    const responsePromise = page.waitForResponse((response) => response.url().endsWith('/api/tasks') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Add Task', exact: true }).click();
    const response = await responsePromise;
    if (response.status() !== 201) throw new Error('Creating a screenshot task failed.');
    const task = await response.json();
    createdTaskIds.push(task.id);
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  await page.screenshot({ path: fileURLToPath(new URL('02-tasks-added.png', outputDirectory)), fullPage: true });

  const checkbox = page.getByRole('checkbox', { name: `Mark ${titles[0]} as completed`, exact: true });
  const completionResponse = page.waitForResponse((response) => response.url().includes('/api/tasks/') && response.request().method() === 'PATCH');
  await checkbox.click();
  if ((await completionResponse).status() !== 200) throw new Error('Saving task completion failed.');
  await expect(page.getByRole('checkbox', { name: `Mark ${titles[0]} as active`, exact: true })).toBeChecked();
  await page.reload();
  await expect(page.getByRole('checkbox', { name: `Mark ${titles[0]} as active`, exact: true })).toBeChecked();
  await page.screenshot({ path: fileURLToPath(new URL('03-completion-after-refresh.png', outputDirectory)), fullPage: true });

  await page.getByRole('button', { name: `Delete ${titles[2]}`, exact: true }).click();
  await expect(page.getByText(titles[2], { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText(titles[2], { exact: true })).toHaveCount(0);
  await expect(page.getByText(titles[0], { exact: true })).toBeVisible();
  await page.screenshot({ path: fileURLToPath(new URL('04-task-deleted.png', outputDirectory)), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: fileURLToPath(new URL('05-mobile.png', outputDirectory)), fullPage: true });
  console.log('Verified add, completion, refresh persistence, and deletion. Screenshots saved in submission/screenshots/.');
} finally {
  // Remove only the tasks created by this script; keep any existing student data.
  for (const id of createdTaskIds) {
    await page.request.delete(`${baseURL}/api/tasks/${id}`).catch(() => {});
  }
  await browser.close();
}
