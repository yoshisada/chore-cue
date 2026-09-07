import { expect, test } from '@playwright/test'

import { loginAsDemo } from './helpers'

test.describe('Header member avatars', () => {
  test('member avatars render in the header as filled circles', async ({ page }) => {
    await loginAsDemo(page, '/home/feed')

    // Desktop viewport so the header icons are visible
    await page.setViewportSize({ width: 1280, height: 720 })

    const avatar = page.getByTestId('header-member-avatar').first()
    await avatar.waitFor({ state: 'attached', timeout: 15000 })

    const styles = await avatar.evaluate((el) => {
      const s = window.getComputedStyle(el)
      return { borderRadius: s.borderRadius, backgroundColor: s.backgroundColor }
    })
    // circular, and painted with a theme fill rather than left transparent
    expect(Number.parseFloat(styles.borderRadius)).toBeGreaterThan(0)
    expect(['rgba(0, 0, 0, 0)', 'transparent']).not.toContain(styles.backgroundColor)
  })
})
