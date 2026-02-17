import fp from 'fastify-plugin'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import OktaJwtVerifier from '@okta/jwt-verifier'
import { config } from '../config'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    user: { sub: string; claims: Record<string, unknown> }
  }
}

export default fp(async function authPlugin(server: FastifyInstance) {
  const jwtVerifier = new OktaJwtVerifier({
    issuer: config.okta.issuer,
    clientId: config.okta.clientId,
  })

  server.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid Authorization header' })
    }

    const token = authHeader.split(' ')[1]
    try {
      const jwt = await jwtVerifier.verifyAccessToken(token, config.okta.audience)
      request.user = { sub: jwt.claims.sub as string, claims: jwt.claims as Record<string, unknown> }
    } catch (err) {
      return reply.status(401).send({ error: 'Invalid or expired token' })
    }
  })
})
