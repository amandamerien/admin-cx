import { betterAuth } from 'better-auth'
import { createAuthConfig } from './configs.js'

/**
 * Serviço que expõe a instância do Better Auth para os módulos (rotas e o
 * handler /api/auth/*). Injetado em `scope.services.auth`.
 */
export class BetterAuthService {
  readonly auth = betterAuth(createAuthConfig())
}
