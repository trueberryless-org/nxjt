import { describe, expect, test } from 'vitest'

import { CommandDefinitions, parseCommandStr } from '../libs/commands'

type CommandType = keyof typeof CommandDefinitions

const getCommandKeyword = (type: CommandType) => CommandDefinitions[type].keyword

test('returns an invalid command with an empty string', () => {
  expect(parseCommandStr('')).toMatchObject({ type: 'invalid' })
})

test('returns the search command for unknown commands', () => {
  const query = 'unknown'
  const result = parseCommandStr(query)

  expect(result).toMatchObject({
    type: 'search',
    query: `site:https://npmx.dev ${query}`,
  })
})

describe.each(Object.keys(CommandDefinitions) as CommandType[])("handles the '%s' command", (type) => {
  const keyword = getCommandKeyword(type)

  test('returns the correct type', () => {
    expect(parseCommandStr(keyword)).toMatchObject({ type })
  })

  test('trims command strings', () => {
    expect(parseCommandStr(`  ${keyword}  `)).toMatchObject({ type })
  })

  test('returns the correct type and query', () => {
    const queryText = 'this is a test'
    expect(parseCommandStr(`${keyword} ${queryText}`)).toMatchObject({
      type,
      query: queryText,
    })
  })
})

test('returns the search command if a known keyword is used as a query', () => {
  const keyword = getCommandKeyword('github')
  const input = `unknown ${keyword}`

  expect(parseCommandStr(input)).toMatchObject({
    type: 'search',
    query: `site:https://npmx.dev ${input}`,
  })
})

test('replaces query placeholders in redirect URLs', () => {
  const queryText = 'FACET_INFO'
  const result = parseCommandStr(`${getCommandKeyword('code_search')} ${queryText}`)

  expect(result.redirect).toContain(`q=repo%3Anpmx-dev%2Fnpmx.dev%20${queryText}`)
})

test('replaces __NPMX_QUERY__ in search fallback', () => {
  const input = 'random search'
  const result = parseCommandStr(input)

  expect(result.redirect).toBe(`https://duckduckgo.com/?no_redirect=0&q=! site:https://npmx.dev ${input}`)
})
