import { tp } from '@/utils/fastify.js'

/**
 * Monta o Better Auth em /api/auth/* (login, registro, sessão, logout...).
 * `hide: true` — essas rotas NÃO entram no OpenAPI/Kubb (o front usa o client
 * do Better Auth, não os hooks gerados).
 */
export const betterAuthRoute = tp(async (scope) => {
  scope.route({
    schema: { hide: true },
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      try {
        const proto =
          (request.headers['x-forwarded-proto'] as string | undefined) ||
          request.protocol ||
          'http'
        const url = new URL(request.url, `${proto}://${request.headers.host}`)

        const headers = new Headers()
        for (const [key, value] of Object.entries(request.headers)) {
          if (value) headers.append(key, value.toString())
        }

        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          body: request.body ? JSON.stringify(request.body) : undefined,
        })

        const response = await scope.services.auth.auth.handler(req)

        reply.status(response.status)
        for (const [key, value] of response.headers.entries()) {
          reply.header(key, value)
        }
        return reply.send(response.body ? await response.text() : null)
      } catch (error) {
        scope.log.error(error, 'Erro de autenticação')
        return reply
          .status(500)
          .send({ error: 'Erro interno de autenticação', code: 'AUTH_FAILURE' })
      }
    },
  })
})
