import { Client } from '@okta/okta-sdk-nodejs'
import { config } from './config'
import { db } from './db'

export const oktaClient = new Client({
  orgUrl: config.okta.orgUrl,
  token: config.okta.apiToken,
})

export function attachOktaRequestLogging() {
  oktaClient.requestExecutor.on('request', (request: { url?: string; method?: string }) => {
    const method = (request.method || 'GET').toUpperCase()
    console.log(`Okta Request: ${method} ${request.url}`)
    db('okta_requests').insert({
      method,
      url: request.url,
    }).catch((err: unknown) => console.error('Failed to log okta request:', err))
  })

  oktaClient.requestExecutor.on('response', (response: { status?: number; url?: string; text?: () => Promise<string> }) => {
    console.log(`Okta Response: ${response.status} ${response.url}`)
    // Clone the response body for logging — response.text() may not be available on all response types
    const bodyPromise = typeof response.text === 'function'
      ? response.text().catch(() => null)
      : Promise.resolve(null)

    bodyPromise.then((body) => {
      db('okta_responses').insert({
        status: response.status,
        url: response.url,
        body: body ?? null,
      }).catch((err: unknown) => console.error('Failed to log okta response:', err))
    })
  })
}
