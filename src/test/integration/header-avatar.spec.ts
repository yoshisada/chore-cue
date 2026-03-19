import { test, expect } from '@playwright/test'
import { loginAsDemo } from './helpers'

test.describe('Header avatar button – no background', () => {
  test('profile icon button and avatar have transparent background', async ({ page }) => {
    await loginAsDemo(page, '/home/feed')

    // Desktop viewport so the header icons are visible
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.waitForTimeout(1000)

    // Find the settings button, then locate the avatar button nearby
    const settingsBtn = page.locator('button[aria-label="Settings"]')
    await expect(settingsBtn).toBeVisible()

    const settingsBox = await settingsBtn.boundingBox()
    expect(settingsBox).not.toBeNull()

    // Find buttons in the top header area, to the left of settings, without aria-label
    const allButtons = page.locator('button')
    const count = await allButtons.count()

    let avatarBtn = null
    for (let i = 0; i < count; i++) {
      const btn = allButtons.nth(i)
      const box = await btn.boundingBox()
      if (!box) continue
      const ariaLabel = await btn.getAttribute('aria-label')
      if (ariaLabel) continue

      // In the header area (top 80px), to the left of settings
      if (box.y < 80 && box.x < settingsBox!.x && Math.abs(box.y - settingsBox!.y) < 20) {
        avatarBtn = btn
      }
    }

    expect(avatarBtn, 'Avatar button should exist in the header').not.toBeNull()

    // Check the button's background
    const btnBg = await avatarBtn!.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    console.log(`Button background-color: ${btnBg}`)

    // Check ALL descendants for non-transparent backgrounds
    const descendantBgs = await avatarBtn!.evaluate((el) => {
      const results: { tag: string; class: string; bg: string }[] = []
      const walk = (node: Element) => {
        const bg = window.getComputedStyle(node).backgroundColor
        if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          results.push({
            tag: node.tagName,
            class: node.className.toString().slice(0, 80),
            bg,
          })
        }
        for (const child of node.children) walk(child)
      }
      walk(el)
      return results
    })

    console.log('Elements with non-transparent backgrounds:', JSON.stringify(descendantBgs, null, 2))

    // Take a cropped screenshot of the header
    await page.screenshot({
      path: 'src/test/integration/.output/header-avatar.png',
      clip: { x: 0, y: 0, width: 1280, height: 70 },
    })

    // Button itself should be transparent
    expect(
      btnBg === 'transparent' || btnBg === 'rgba(0, 0, 0, 0)',
      `Button bg should be transparent, got: ${btnBg}`
    ).toBe(true)

    // No descendants should have a visible background
    expect(
      descendantBgs,
      `No avatar descendant should have a background. Found: ${JSON.stringify(descendantBgs)}`
    ).toHaveLength(0)
  })
})
