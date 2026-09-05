import { prisma } from '@repo/database'
import type { BetterAuthOptions } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
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
    },
    user: { modelName: 'users' },
    session: { modelName: 'sessions' },
    account: { modelName: 'accounts' },
    verification: { modelName: 'verifications' },
    advanced: {
      // O Postgres gera os UUIDs (gen_random_uuid) — ver schema.prisma.
      database: { generateId: false },
    },
    trustedOrigins: [env.APP_URL],
  } satisfies BetterAuthOptions
}
