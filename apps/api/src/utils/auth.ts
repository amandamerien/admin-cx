import { betterAuth } from 'better-auth'
import { createAuthConfig } from '@/modules/better-auth/configs.js'

/**
 * Instância usada pelo CLI do Better Auth (`pnpm auth:generate`) para derivar
 * o schema do Prisma. Em runtime, a API usa a instância de `BetterAuthService`.
 */
export const auth = betterAuth(createAuthConfig())

/** Converte os headers do Fastify para o `Headers` do fetch (Better Auth). */
export function toHeaders(request: {
  headers: Record<string, string | string[] | undefined>
}): Headers {
  const headers = new Headers()
  for (const [key, value] of Object.entries(request.headers)) {
    if (value)
      headers.append(key, Array.isArray(value) ? (value[0] ?? '') : value)
  }
  return headers
}
