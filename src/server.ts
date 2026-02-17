import Fastify from 'fastify'
import { config } from './config'
import { initDb, db } from './db'
import { attachOktaRequestLogging } from './okta-client'
import authPlugin from './plugins/auth'
import { userRoutes } from './routes/users'

const server = Fastify({ logger: true })

// Log every incoming request to SQLite
server.addHook('onRequest', async (request) => {
  db('incoming_requests').insert({
    method: request.method,
    url: request.url,
    query_string: request.url.includes('?') ? request.url.split('?')[1] : null,
    ip: request.ip,
  }).catch((err: unknown) => server.log.error(err, 'Failed to log incoming request'))
})

server.register(authPlugin)
server.register(userRoutes, { prefix: '/api/v1/' })

server.get('/health', async () => {
  return { status: 'ok' }
})

const start = async () => {
  try {
    await initDb()
    attachOktaRequestLogging()
    await server.listen({ port: config.port, host: '0.0.0.0' })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
