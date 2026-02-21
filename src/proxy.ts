import { FastifyRequest, FastifyReply } from 'fastify'
import { config } from './config'

const OKTA_BASE = `${config.okta.orgUrl}/api/v1`

export function createOktaProxy(resource: string) {
  return async function proxyToOkta(
    request: FastifyRequest<{ Params: { '*'?: string } }>,
    reply: FastifyReply,
  ) {
    const path = (request.params as any)['*']
    const oktaUrl = path
      ? `${OKTA_BASE}/${resource}/${path}`
      : `${OKTA_BASE}/${resource}`

    const url = new URL(oktaUrl)
    const qs = request.url.split('?')[1]
    if (qs) {
      url.search = qs
    }

    const headers: Record<string, string> = {
      'Authorization': `SSWS ${config.okta.apiToken}`,
      'Accept': 'application/json',
    }

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
}
