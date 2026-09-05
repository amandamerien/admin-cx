import type { FastifyInstance } from 'fastify'
import { BetterAuthService } from '@/modules/better-auth/service.js'
import { MeService } from '@/modules/me/service.js'
import { tp } from '@/utils/fastify.js'

// Torna `app.services` disponível e tipado em todas as rotas.
declare module 'fastify' {
  interface FastifyInstance {
    services: {
      auth: BetterAuthService
      me: MeService
    }
  }
}

export const servicePlugin = tp(async (scope) => {
  scope.decorate('services', createServices())
})

export function createServices(): FastifyInstance['services'] {
  return {
    auth: new BetterAuthService(),
    me: new MeService(),
  }
}
