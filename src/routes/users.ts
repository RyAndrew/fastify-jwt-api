import { FastifyInstance } from 'fastify'
import { createOktaProxy } from '../proxy'

export async function userRoutes(server: FastifyInstance) {
  server.addHook('onRequest', server.authenticate)

  const proxy = createOktaProxy('users')
  server.all('/users', proxy)
  server.all('/users/*', proxy)
}
