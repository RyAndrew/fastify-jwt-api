import { FastifyInstance } from 'fastify'
import { createOktaProxy } from '../proxy'

export async function logRoutes(server: FastifyInstance) {
  server.addHook('onRequest', server.authenticate)

  const proxy = createOktaProxy('logs')
  server.all('/logs', proxy)
  server.all('/logs/*', proxy)
}
