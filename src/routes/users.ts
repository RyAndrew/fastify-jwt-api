import { FastifyInstance, FastifyRequest } from 'fastify'
import { oktaClient } from '../okta-client'

interface UserParams {
  userId: string
}

interface CreateUserBody {
  profile: {
    firstName: string
    lastName: string
    email: string
    login: string
  }
  credentials?: {
    password?: { value: string }
  }
}

interface UpdateUserBody {
  profile: Record<string, unknown>
}

interface ListUsersQuery {
  q?: string
  search?: string
  filter?: string
  limit?: number
}

export async function userRoutes(server: FastifyInstance) {
  server.addHook('onRequest', server.authenticate)

  // Create a user
  server.post<{ Body: CreateUserBody }>('/users', {
    schema: {
      body: {
        type: 'object',
        required: ['profile'],
        properties: {
          profile: {
            type: 'object',
            required: ['firstName', 'lastName', 'email', 'login'],
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              login: { type: 'string' },
            },
          },
          credentials: {
            type: 'object',
            properties: {
              password: {
                type: 'object',
                properties: { value: { type: 'string' } },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const user = await oktaClient.userApi.createUser({ body: request.body })
    return reply.status(201).send(user)
  })

  // List users
  server.get<{ Querystring: ListUsersQuery }>('/users', async (request) => {
    const { q, search, filter, limit } = request.query
    const collection = await oktaClient.userApi.listUsers({ q, search, filter, limit })
    const users: unknown[] = []
    for await (const user of collection) {
      users.push(user)
    }
    return users
  })

  // Get a single user
  server.get<{ Params: UserParams }>('/users/:userId', async (request) => {
    return oktaClient.userApi.getUser({ userId: request.params.userId })
  })

  // Update a user
  server.put<{ Params: UserParams; Body: UpdateUserBody }>('/users/:userId', async (request) => {
    return oktaClient.userApi.updateUser({
      userId: request.params.userId,
      user: { profile: request.body.profile as any },
    })
  })

  // Delete a user (deactivate first, then delete)
  server.delete<{ Params: UserParams }>('/users/:userId', async (request, reply) => {
    const { userId } = request.params
    await oktaClient.userApi.deactivateUser({ userId })
    await oktaClient.userApi.deleteUser({ userId })
    return reply.status(204).send()
  })

  // --- Lifecycle operations ---

  server.post<{ Params: UserParams }>('/users/:userId/lifecycle/activate', async (request) => {
    await oktaClient.userApi.activateUser({ userId: request.params.userId, sendEmail: false })
    return { status: 'activated' }
  })

  server.post<{ Params: UserParams }>('/users/:userId/lifecycle/deactivate', async (request) => {
    await oktaClient.userApi.deactivateUser({ userId: request.params.userId })
    return { status: 'deactivated' }
  })

  server.post<{ Params: UserParams }>('/users/:userId/lifecycle/suspend', async (request) => {
    await oktaClient.userApi.suspendUser({ userId: request.params.userId })
    return { status: 'suspended' }
  })

  server.post<{ Params: UserParams }>('/users/:userId/lifecycle/unsuspend', async (request) => {
    await oktaClient.userApi.unsuspendUser({ userId: request.params.userId })
    return { status: 'unsuspended' }
  })

  server.post<{ Params: UserParams }>('/users/:userId/lifecycle/reset-password', async (request) => {
    await oktaClient.userApi.generateResetPasswordToken({ userId: request.params.userId, sendEmail: true })
    return { status: 'password_reset_sent' }
  })
}
