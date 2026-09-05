import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { z } from 'zod'

// Carrega o .env da raiz do monorepo (fonte única de verdade)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../../../../.env') })

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  APP_URL: z.url(),
  PORT: z.coerce.number().default(3333),
  ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export const env = schema.parse(process.env)
