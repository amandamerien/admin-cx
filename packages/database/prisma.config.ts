import { resolve } from 'node:path'
import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Carrega o .env da raiz do monorepo (fonte única de verdade)
config({ path: resolve(__dirname, '../../.env') })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
