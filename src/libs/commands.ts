const gitHubBaseUrl = 'https://github.com'
const npmxGitHubUrl = `${gitHubBaseUrl}/npmx-dev/npmx.dev`
const npmxUrl = 'https://npmx.dev'
const docsUrl = 'https://docs.npmx.dev'
const searchEngineUrl = 'https://duckduckgo.com/?no_redirect=0&q=! '

export const CommandDefinitions = {
  code_search: {
    description: 'Code search the provided text',
    example: 's FACET_INFO',
    keyword: 's',
    redirect: `${gitHubBaseUrl}/search?q=repo%3Anpmx-dev%2Fnpmx.dev%20__NXJT_QUERY__&type=code`,
  },
  github: {
    description: 'GitHub repository',
    example: 'g',
    keyword: 'g',
    redirect: `${npmxGitHubUrl}/`,
  },
  pull_requests: {
    description: 'Pull requests',
    example: 'p',
    keyword: 'p',
    redirect: `${npmxGitHubUrl}/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc`,
  },
  issues: {
    description: 'Issues',
    example: 'i',
    keyword: 'i',
    redirect: `${npmxGitHubUrl}/issues`,
  },
  translation: {
    description: 'Translation status',
    example: 't',
    keyword: 't',
    redirect: 'https://i18n.npmx.dev/',
  },
  docs: {
    description: 'Docs',
    example: 'd',
    keyword: 'd',
    redirect: docsUrl,
  },
  home: {
    description: 'Homepage',
    example: 'h',
    keyword: 'h',
    redirect: npmxUrl,
  },
} as const satisfies Record<string, CommandDefinition>

const commandRegex = /^(?<keyword>\w+)(?:[\s+]+(?<query>.*))?$/i

const commandKeywordsMap = new Map<CommandKeyword, CommandType>(
  Object.entries(CommandDefinitions).map(([type, definition]) => [definition.keyword, type as CommandType]),
)

export function parseCommandStr(commandStr: string): Command {
  const sanitizedCommandStr = commandStr.trim()

  if (sanitizedCommandStr.length === 0) {
    return { type: 'invalid' }
  }

  const documentationSearchQuery = `site:${docsUrl} ${sanitizedCommandStr}`
  const fallbackSearchCommand: Command = makeCommand({
    type: 'search',
    query: documentationSearchQuery,
    redirect: `${searchEngineUrl}__NXJT_QUERY__`,
  })

  const match = sanitizedCommandStr.match(commandRegex)
  const { keyword, query } = match?.groups ?? {}

  if (!keyword) {
    return fallbackSearchCommand
  }

  const commandDefinition = getCommandDefinitionFromKeyword(keyword)

  if (!commandDefinition) {
    return fallbackSearchCommand
  }

  const [type, { keyword: _, ...definition }] = commandDefinition

  return makeCommand({
    ...definition,
    type,
    query,
  })
}

function getCommandDefinitionFromKeyword(keyword: string): [CommandType, CommandDefinition] | undefined {
  const commandType = commandKeywordsMap.get(keyword as CommandKeyword)
  return commandType ? [commandType, CommandDefinitions[commandType]] : undefined
}

function makeCommand(command: Command): Command {
  if (command.redirect) {
    command.redirect = command.redirect.replaceAll('__NXJT_QUERY__', command.query ?? '')
  }
  return command
}

interface CommandDefinition {
  description?: string
  example?: string
  keyword: string
  redirect?: string
}

type CommandType = keyof typeof CommandDefinitions
type CommandKeyword = (typeof CommandDefinitions)[keyof typeof CommandDefinitions]['keyword']

interface Command extends Omit<CommandDefinition, 'keyword'> {
  type: CommandType | 'search' | 'invalid'
  query?: string | undefined
}
