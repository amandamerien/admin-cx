import { toHeaders } from '@/utils/auth.js'
import { tp } from '@/utils/fastify.js'
import { meErrorSchema, meResponseSchema } from './schemas.js'

/**
 * GET /me — rota protegida de exemplo. Fluxo completo do padrão:
 * Zod schema → OpenAPI (@fastify/swagger) → Kubb gera `useGetMe` → app consome.
 */
export const meRoute = tp(async (scope) => {
  scope.get(
    '/me',
    {
      schema: {
        tags: ['Me'],
        summary: 'Retorna o usuário autenticado',
        response: {
          200: meResponseSchema,
          401: meErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await scope.services.auth.auth.api.getSession({
        headers: toHeaders(request),
      })

      if (!session?.user) {
        return reply.status(401).send({ error: 'Não autenticado' })
      }

      const profile = await scope.services.me.getProfile(session.user.id)
      if (!profile) {
        return reply.status(401).send({ error: 'Não autenticado' })
      }

      return reply.status(200).send(profile)
    },
  )
})
