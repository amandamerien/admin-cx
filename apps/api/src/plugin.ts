import fs from 'node:fs'
import cookie from '@fastify/cookie'
import { fastifyCors } from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifyScalar from '@scalar/fastify-api-reference'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { routesPlugin } from '@/routes.js'
import { servicePlugin } from '@/services.js'
import { env } from '@/utils/environment.js'
import { tp } from '@/utils/fastify.js'

/**
 * Plugin raiz da API: liga o Zod (validação/serialização), o OpenAPI
 * (@fastify/swagger + Scalar), CORS/cookies, os serviços e as rotas.
 */
export const backendPlugin = tp(async (app) => {
  // Zod como validador e serializador (fastify-type-provider-zod)
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  // OpenAPI — a fonte que o Kubb consome para gerar o api-client
  await app.register(fastifySwagger, {
    mode: 'dynamic',
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Boilerplate API',
        description: 'API do boilerplate',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  })

  if (env.ENV === 'development') {
    // Documentação interativa em http://localhost:3333/reference
    await app.register(fastifyScalar, {
      routePrefix: '/reference',
      configuration: { url: '/openapi.json' },
    })
    app.get('/openapi.json', { schema: { hide: true } }, async () =>
      app.swagger(),
    )

    // Escreve o openapi.yaml ao subir (consumido pelo Kubb via `pnpm api-client`)
    app.addHook('onListen', async () => {
      await fs.promises.writeFile(
        'openapi.yaml',
        JSON.stringify(app.swagger(), null, 2),
      )
      app.log.info('openapi.yaml atualizado')
    })
  }

  // Cookies (sessão do Better Auth)
  await app.register(cookie, { secret: env.BETTER_AUTH_SECRET })

  // CORS com credenciais — necessário para o cookie cross-origin (front:5173)
  app.register(fastifyCors, {
    origin: env.APP_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  // Serviços (injetados em app.services) e rotas
  await app.register(servicePlugin)
  await app.register(routesPlugin)

  // Healthcheck simples
  app.get('/health', { schema: { hide: true } }, async (_, reply) =>
    reply.status(200).send({ status: 'ok' }),
  )
})
