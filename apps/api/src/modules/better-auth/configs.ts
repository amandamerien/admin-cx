import { prisma } from '@repo/database'
import type { BetterAuthOptions } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { env } from '@/utils/environment.js'

/**
 * Configuração do Better Auth (email/senha). Mantida simples de propósito —
 * é o ponto onde o curso liga plugins (organization, admin, 2FA, OAuth...).
 * O schema do Prisma é derivado daqui via `pnpm auth:generate`.
 */
export function createAuthConfig(): BetterAuthOptions {
  return {
    appName: 'Boilerplate',
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: '/api/auth',
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      /* O padrão da lib é 8. Baixado para caber a senha padrão de
         administrador (adm@123, 7 caracteres). */
      minPasswordLength: 6,
    },
    user: { modelName: 'users' },
    session: { modelName: 'sessions' },
    account: { modelName: 'accounts' },
    verification: { modelName: 'verifications' },
    hooks: {
      /* Entrar no painel depende da ficha da equipe, não só da conta.
       *
       * Roda antes do /sign-in/email, então barra a pessoa na porta em vez de
       * deixá-la entrar numa tela vazia. Cobre os dois casos: quem foi
       * excluído da equipe (ficha some) e quem está com o "Acesso liberado"
       * desligado. O cadastro interno (POST /administradores) não passa por
       * aqui — ele chama a API do Better Auth direto. */
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== '/sign-in/email') return

        const email = (ctx.body as { email?: string } | undefined)?.email
        if (!email) return

        const ficha = await prisma.administrador.findUnique({
          where: { email: email.toLowerCase() },
        })

        if (!ficha) {
          throw new APIError('FORBIDDEN', {
            message: 'Esta conta não está vinculada à equipe.',
          })
        }

        if (!ficha.ativo) {
          throw new APIError('FORBIDDEN', {
            message: 'O acesso desta pessoa está desativado.',
          })
        }
      }),
    },
    advanced: {
      // O Postgres gera os UUIDs (gen_random_uuid) — ver schema.prisma.
      database: { generateId: false },
    },
    trustedOrigins: [env.APP_URL],
  } satisfies BetterAuthOptions
}
