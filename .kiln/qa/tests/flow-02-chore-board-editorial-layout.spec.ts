import { test, expect } from '@playwright/test';

test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
});

test.skip('US-002/FR-008: Chore board renders sections with thin borders, not colored backgrounds — requires credentials', async ({ page }) => {
  // blocked:credentials
  await page.goto('/');
  // Step 1: Log in
  // Step 2: Navigate to chore board
  // Step 3: Verify section separators are thin borders, not colored background blocks
  // Verify: no colored section backgrounds
});

test.skip('US-002/FR-007: Overdue section label is uppercase with wide letter spacing and gold accent — requires credentials', async ({ page }) => {
  // blocked:credentials
  await page.goto('/');
  // Step 1: Log in, navigate to chore board with overdue chores
  // Step 2: Inspect "Overdue" section label
  // Verify: text-transform: uppercase, letter-spacing wider than body, gold accent on marker
});

test.skip('US-002/FR-007: Due section label is uppercase with wide letter spacing — requires credentials', async ({ page }) => {
  // blocked:credentials
  await page.goto('/');
  // Step 1: Log in, navigate to chore board
  // Step 2: Inspect "Due" section label
  // Verify: text-transform: uppercase, wider letter spacing
});

test.skip('US-002/FR-007: Upcoming section label is uppercase with wide letter spacing — requires credentials', async ({ page }) => {
  // blocked:credentials
  await page.goto('/');
  // Step 1: Log in, navigate to chore board
  // Step 2: Inspect "Upcoming" section label
  // Verify: text-transform: uppercase, wider letter spacing
});

test.skip('US-002/FR-016: Chore card has thin top border, generous padding, editorial hierarchy — requires credentials', async ({ page }) => {
  // blocked:credentials
  await page.goto('/');
  // Step 1: Log in, navigate to chore board
  // Step 2: Inspect a chore card
  // Verify: thin top border, spacious padding, clear title/assignee/due hierarchy
});
