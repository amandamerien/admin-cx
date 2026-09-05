import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import { Pool } from 'pg'
import { PrismaClient } from '../generated/client/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Carrega o .env da raiz quando DATABASE_URL não está no ambiente
// (ex.: migrations, scripts CLI).
if (!process.env.DATABASE_URL) {
  config({ path: path.resolve(__dirname, '../../../.env') })
}

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

// Pool do node-postgres — funciona com Postgres local e com o Neon
// (basta a connection string com sslmode=require).
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export * from '../generated/client/index.js'
export { PrismaClient } from '../generated/client/index.js'
