import Knex from 'knex'
import path from 'path'

export const db = Knex({
  client: 'better-sqlite3',
  connection: {
    filename: path.resolve(__dirname, '..', 'okta-user-api.db'),
  },
  useNullAsDefault: true,
})

export async function initDb() {
  if (!(await db.schema.hasTable('incoming_requests'))) {
    await db.schema.createTable('incoming_requests', (table) => {
      table.increments('id')
      table.string('method').notNullable()
      table.text('url').notNullable()
      table.text('query_string').nullable()
      table.string('ip').nullable()
      table.timestamp('created_at').defaultTo(db.fn.now())
    })
  }

  if (!(await db.schema.hasTable('okta_requests'))) {
    await db.schema.createTable('okta_requests', (table) => {
      table.increments('id')
      table.string('method').nullable()
      table.text('url').nullable()
      table.timestamp('created_at').defaultTo(db.fn.now())
    })
  }

  if (!(await db.schema.hasTable('okta_responses'))) {
    await db.schema.createTable('okta_responses', (table) => {
      table.increments('id')
      table.integer('status').nullable()
      table.text('url').nullable()
      table.text('body').nullable()
      table.timestamp('created_at').defaultTo(db.fn.now())
    })
  }
}
