import { defineMiddleware } from 'astro:middleware'

import { parseCommandStr } from './libs/commands'

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.url)
  if (url.pathname !== '/') return next()

  const query = url.searchParams.get('q')
  if (!query) return next()

  const command = parseCommandStr(query)
  if (command.type === 'invalid' || !command.redirect) return next()

  const response = new Response(null, {
    status: 302,
    headers: {
      Location: command.redirect,
    },
  })

  const location = response.headers.get('Location')
  if (location && location.includes('?')) {
    const [base, queryString] = location.split('?')
    const redirectParams = new URLSearchParams(queryString)

    let identical = true
    for (const [key, value] of url.searchParams.entries()) {
      if (redirectParams.get(key) !== value) {
        identical = false
        break
      }
    }

    if (identical && base) {
      response.headers.set('Location', base)
    }
  }

  return response
})
