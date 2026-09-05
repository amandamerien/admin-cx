import type {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify'
import fp, { type PluginMetadata } from 'fastify-plugin'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

/**
 * Envolve um plugin Fastify já com os tipos do ZodTypeProvider — assim
 * `scope.get(...)` infere request/response a partir dos schemas Zod.
 */
export function tp<Options extends FastifyPluginOptions = Record<never, never>>(
  plugin: FastifyPluginAsync<
    Options,
    RawServerDefault,
    ZodTypeProvider,
    FastifyBaseLogger
  >,
  options?: PluginMetadata,
) {
  return fp<Options>(plugin, options)
}

/** FastifyInstance tipado com o ZodTypeProvider. */
export type FastifyTypeInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  ZodTypeProvider
>
