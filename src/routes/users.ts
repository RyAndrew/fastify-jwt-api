import { FastifyInstance } from 'fastify'
import { config } from '../config'

const OKTA_BASE = `${config.okta.orgUrl}/api/v1`

export async function userRoutes(server: FastifyInstance) {
  server.addHook('onRequest', server.authenticate)

  server.all('/users', proxyToOkta)
  server.all('/users/*', proxyToOkta)
}

async function proxyToOkta(
  request: import('fastify').FastifyRequest<{ Params: { '*'?: string } }>,
  reply: import('fastify').FastifyReply,
) {
  const path = (request.params as any)['*']
  const oktaUrl = path
    ? `${OKTA_BASE}/users/${path}`
    : `${OKTA_BASE}/users`

  // Forward query string
  const url = new URL(oktaUrl)
  const qs = request.url.split('?')[1]
  if (qs) {
    url.search = qs
  }

  const headers: Record<string, string> = {
    'Authorization': `SSWS ${config.okta.apiToken}`,
    'Accept': 'application/json',
  }

  // Forward body for methods that have one
  let body: string | undefined
  if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
    body = JSON.stringify(request.body)
    headers['Content-Type'] = 'application/json'
  }

  const oktaResponse = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
  })

  // Forward status and relevant headers
  reply.status(oktaResponse.status)

  const contentType = oktaResponse.headers.get('content-type')
  if (contentType) {
    reply.header('content-type', contentType)
  }

  const rateLimitRemaining = oktaResponse.headers.get('x-rate-limit-remaining')
  if (rateLimitRemaining) {
    reply.header('x-rate-limit-remaining', rateLimitRemaining)
  }

  const responseText = await oktaResponse.text()
  return reply.send(responseText)
}
