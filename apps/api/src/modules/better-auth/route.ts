import type { FastifyRequest } from 'fastify'
import type { FastifyTypeInstance } from '@/utils/fastify.js'
import { tp } from '@/utils/fastify.js'

/* Registra a entrada, sem deixar o log atrapalhar o login: se a gravação
 * falhar, a pessoa entra do mesmo jeito e o erro fica no log do servidor. */
async function registrarEntrada(
  scope: FastifyTypeInstance,
  request: FastifyRequest,
  corpo: string,
) {
  try {
    const dados = JSON.parse(corpo) as {
      user?: { id: string; name: string; email: string }
    }
    if (!dados.user) return

    await scope.services.painel.registrarAcesso({
      userId: dados.user.id,
      nome: dados.user.name,
      email: dados.user.email,
      ip: request.ip || null,
      userAgent: (request.headers['user-agent'] as string | undefined) ?? null,
    })
  } catch (erro) {
    scope.log.error(erro, 'Não foi possível registrar a entrada')
  }
}

/**
 * Monta o Better Auth em /api/auth/* (login, sessão, logout...).
 * `hide: true` — essas rotas NÃO entram no OpenAPI/Kubb (o front usa o client
 * do Better Auth, não os hooks gerados).
 */
export const betterAuthRoute = tp(async (scope) => {
  scope.route({
    schema: { hide: true },
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      /* O painel não tem cadastro público: contas nascem em POST
         /administradores, que chama o Better Auth por dentro (sem passar por
         aqui). Deixar /sign-up aberto deixaria qualquer um criar acesso. */
      if (request.url.startsWith('/api/auth/sign-up')) {
        return reply.status(403).send({
          error: 'O cadastro é feito por um administrador do painel',
          code: 'SIGNUP_DISABLED',
        })
      }

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

        /* O Better Auth descobre o IP por cabeçalho. Como a Request aqui é
           montada à mão, sem isto ele grava a sessão sem endereço nenhum — e a
           aba de Acessos fica com a coluna de IP vazia. */
        if (!headers.has('x-forwarded-for') && request.ip) {
          headers.set('x-forwarded-for', request.ip)
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

        const corpo = response.body ? await response.text() : null

        /* Uma linha por entrada no painel. Aqui é onde o login de verdade
           passa — o cadastro feito por um administrador vai por /sign-up e
           não conta como acesso de ninguém. */
        if (
          request.url.startsWith('/api/auth/sign-in') &&
          response.status >= 200 &&
          response.status < 300 &&
          corpo
        ) {
          await registrarEntrada(scope, request, corpo)
        }

        return reply.send(corpo)
      } catch (error) {
        scope.log.error(error, 'Erro de autenticação')
        return reply
          .status(500)
          .send({ error: 'Erro interno de autenticação', code: 'AUTH_FAILURE' })
      }
    },
  })
})
