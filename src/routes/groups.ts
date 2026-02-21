import { FastifyInstance } from 'fastify'
import { createOktaProxy } from '../proxy'

export async function groupRoutes(server: FastifyInstance) {
  server.addHook('onRequest', server.authenticate)

  const proxy = createOktaProxy('groups')
  server.all('/groups', proxy)
  server.all('/groups/*', proxy)
}
