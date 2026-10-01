import { describe, expect, test } from 'vitest'

import { getRedirectUrl } from '../../src/libs/redirect'

describe('getRedirectUrl', () => {
  test.each([null, '', '   '])('returns nothing for %j', (query) => {
    expect(getRedirectUrl(query)).toBeUndefined()
  })

  test('adds a reference to destinations without a query string', () => {
    expect(getRedirectUrl('g')?.toString()).toBe('https://github.com/npmx-dev/npmx.dev/?ref=nxjt')
    expect(getRedirectUrl('h')?.toString()).toBe('https://npmx.dev/?ref=nxjt')
  })

  test('keeps destinations that already have a query string', () => {
    expect(getRedirectUrl('p')?.searchParams.has('ref')).toBe(false)
    expect(getRedirectUrl('is-even')?.toString()).toBe('https://npmx.dev/search?q=is-even')
  })

  test('searches the code with the provided text', () => {
    expect(getRedirectUrl('s FACET_INFO')?.searchParams.get('q')).toBe('repo:npmx-dev/npmx.dev FACET_INFO')
  })

  test.each([
    ['@vue/core', '@vue/core'],
    ['a&b=c', 'a&b=c'],
    ['a#b', 'a#b'],
    ['100% sure', '100% sure'],
  ])('keeps the query %j as a single search term', (query, expected) => {
    const destination = getRedirectUrl(query)

    expect(destination?.searchParams.get('q')).toBe(expected)
    expect([...(destination?.searchParams.keys() ?? [])]).toEqual(['q'])
    expect(destination?.hash).toBe('')
  })

  test('never leaves the target hosts', () => {
    for (const query of ['g https://evil.example', 'h //evil.example', 'd @evil.example']) {
      expect(['github.com', 'npmx.dev', 'docs.npmx.dev']).toContain(getRedirectUrl(query)?.hostname)
    }
  })
})
