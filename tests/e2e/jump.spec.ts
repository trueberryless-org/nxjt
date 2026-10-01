import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('redirects', () => {
  test.use({ extraHTTPHeaders: {} })

  const cases = [
    ['g', 'https://github.com/npmx-dev/npmx.dev/?ref=nxjt'],
    ['i', 'https://github.com/npmx-dev/npmx.dev/issues?ref=nxjt'],
    ['d', 'https://docs.npmx.dev/?ref=nxjt'],
    ['is-even', 'https://npmx.dev/search?q=is-even'],
    ['@vue/core', 'https://npmx.dev/search?q=%40vue%2Fcore'],
  ] as const

  for (const [query, location] of cases) {
    test(`jumps from "${query}" to ${location}`, async ({ request }) => {
      const response = await request.get(`/?q=${encodeURIComponent(query)}`, { maxRedirects: 0 })

      expect(response.status()).toBe(302)
      expect(response.headers()['location']).toBe(location)
    })
  }

  test('shows the page without a query', async ({ request }) => {
    expect((await request.get('/', { maxRedirects: 0 })).status()).toBe(200)
    expect((await request.get('/?q=', { maxRedirects: 0 })).status()).toBe(200)
  })
})

test.describe('page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows the input and all commands', async ({ page }) => {
    await expect(page).toHaveTitle('npmx Jump To')
    await expect(page.getByLabel('nxjt')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Available commands' })).toBeVisible()
    await expect(page.locator('nxjt-commands button')).toHaveCount(7)
  })

  test('fills the input when a command is chosen', async ({ page }) => {
    await page.getByRole('button', { name: 'Code search the provided text' }).click()

    await expect(page.getByLabel('nxjt')).toHaveValue('s FACET_INFO')
    await expect(page.getByLabel('nxjt')).toBeFocused()
  })

  test('has canonical and Open Graph metadata', async ({ page }) => {
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://nxjt.netlify.app/')
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://nxjt.netlify.app/og-image.png')
  })

  test('does not scroll horizontally', async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('has no accessibility violations', async ({ page }) => {
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()

    expect(violations.map(({ id, nodes }) => `${id}: ${nodes.map(({ target }) => target.join(' ')).join(', ')}`)).toEqual([])
  })
})

test('shows a 404 page', async ({ page }) => {
  const response = await page.goto('/nothing-here')

  expect(response?.status()).toBe(404)
  await expect(page.getByRole('link', { name: 'Go home' })).toBeVisible()
})
