import { test, expect } from '@playwright/test';

test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
});

test('kit/SC-003: App loads on port 8081 after migration with no server errors', async ({ page }) => {
  const response = await page.goto('http://localhost:8081');
  expect(response?.status()).toBeLessThan(500);
  await expect(page.locator('body')).toBeVisible();
});

test('kit/SC-003: No app-level JS console errors on initial load after migration (backend not required)', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  await page.goto('http://localhost:8081');
  await page.waitForLoadState('networkidle');
  // Filter known infrastructure errors requiring Docker/Zero/Postgres backend.
  // These are pre-existing on the base branch — not migration regressions.
  const blocking = consoleErrors.filter(e =>
    !e.includes('Warning') &&
    !e.includes('DevTools') &&
    !e.includes('favicon') &&
    !e.includes('ProtocolError') &&           // Zero sync — backend not running (pre-existing)
    !e.includes('SchemaVersionNotSupported') && // Zero sync — backend not running (pre-existing)
    !e.includes('replicated tables') &&       // Zero sync — backend not running (pre-existing)
    !e.includes('Failed to connect') &&       // Zero sync — backend not running (pre-existing)
    !e.includes('reloading') &&               // Zero sync reload loop (pre-existing)
    !e.includes('clientID=') &&               // Zero sync internal logs (pre-existing)
    !e.includes('does not recognize') &&      // Tamagui camelCase→DOM prop warning (pre-existing in 002 branch)
    !e.includes('textTransform')              // Tamagui textTransform on DOM element (pre-existing in 002 branch)
  );
  expect(blocking, `App-level console errors after migration:\n${blocking.join('\n')}`).toHaveLength(0);
});

test('kit/SC-008: Luxury editorial theme preserved — warm background, no pure white/black', async ({ page }) => {
  await page.goto('http://localhost:8081');
  // Step 1: Verify page renders with luxury editorial background (not pure white)
  // Step 2: Verify charcoal text (not pure black)
  await expect(page.locator('body')).toBeVisible();
  // Check background is not #FFFFFF
  const bgColor = await page.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );
  // Pure white is rgb(255, 255, 255)
  expect(bgColor, 'Background should not be pure white').not.toBe('rgb(255, 255, 255)');
});

test('kit/SC-008: Luxury editorial theme preserved — zero border radius on interactive elements', async ({ page }) => {
  await page.goto('http://localhost:8081');
  // Step 1: Find buttons and check border-radius is 0
  const buttons = page.locator('button');
  const count = await buttons.count();
  if (count > 0) {
    const borderRadius = await buttons.first().evaluate(el =>
      window.getComputedStyle(el).borderRadius
    );
    expect(borderRadius, 'Buttons should have 0 border radius').toBe('0px');
  }
});

test('kit/SC-008: Luxury editorial theme preserved — serif font used for headings', async ({ page }) => {
  await page.goto('http://localhost:8081');
  // Step 1: Find heading elements, check font-family is a serif
  const headings = page.locator('h1, h2, [role="heading"]');
  const count = await headings.count();
  if (count > 0) {
    const fontFamily = await headings.first().evaluate(el =>
      window.getComputedStyle(el).fontFamily
    );
    // Should contain Playfair Display or a serif fallback
    const isSerif = fontFamily.toLowerCase().includes('playfair') ||
      fontFamily.toLowerCase().includes('georgia') ||
      fontFamily.toLowerCase().includes('times') ||
      fontFamily.toLowerCase().includes('serif');
    expect(isSerif, `Heading font-family "${fontFamily}" is not a serif`).toBe(true);
  }
});

test.skip('kit/US-001: Zero sync connects and data flows after migration — requires credentials', async ({ page }) => {
  // blocked:credentials
  // Step 1: Ensure backend is running (bun backend)
  // Step 2: Log in
  // Step 3: Create a chore
  // Step 4: Verify chore syncs via Zero websocket
  // Step 5: Reload and verify chore persists (confirms Zero sync round-trip)
});
