import { betterAuthRoute } from '@/modules/better-auth/route.js'
import { meRoute } from '@/modules/me/route.js'
import { painelRoute } from '@/modules/painel/route.js'
import { presencaRoute } from '@/modules/presenca/route.js'
import { tp } from '@/utils/fastify.js'

/** Registra todos os módulos de rota. Adicione os seus aqui. */
export const routesPlugin = tp(async (app) => {
  await app.register(betterAuthRoute)
  await app.register(meRoute)
  await app.register(painelRoute)
  await app.register(presencaRoute)
})
