import fastify from 'fastify'
import { backendPlugin } from '@/plugin.js'
import { env } from '@/utils/environment.js'

const app = fastify({ logger: true })

try {
  await app.register(backendPlugin)
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
  app.log.info(`API rodando em http://localhost:${env.PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
