/**
 * Sobe o Fastify em memória, registra todas as rotas e escreve o
 * apps/api/openapi.yaml — sem abrir porta nem conectar no banco. O Kubb lê
 * esse arquivo para gerar o api-client tipado (`pnpm api-client`).
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import fastify from 'fastify'
import { backendPlugin } from '@/plugin.js'

const app = fastify({ logger: false })

await app.register(backendPlugin)
await app.ready()

const spec = app.swagger()
const outputPath = path.resolve(process.cwd(), 'openapi.yaml')
await fs.writeFile(outputPath, JSON.stringify(spec, null, 2))

console.log(`OpenAPI spec escrito em ${outputPath}`)

await app.close()
