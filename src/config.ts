import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT) || 3000,
  okta: {
    orgUrl: requireEnv('OKTA_ORG_URL'),
    apiToken: requireEnv('OKTA_API_TOKEN'),
    clientId: requireEnv('OKTA_CLIENT_ID'),
    issuer: requireEnv('OKTA_ISSUER'),
    audience: process.env.OKTA_AUDIENCE || 'api://default',
  },
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}
