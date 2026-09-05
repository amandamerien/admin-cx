# Boilerplate

Ponto de partida full-stack para o curso. A espinha dorsal é um **api-client
tipado gerado por [Kubb](https://kubb.dev)**: a API descreve suas rotas com Zod,
isso vira um OpenAPI, e o Kubb gera os hooks do TanStack Query que o front
consome — sem escrever `fetch` nem tipos à mão.

```
Zod schema (API)  →  OpenAPI (@fastify/swagger)  →  Kubb  →  hooks TanStack Query  →  App
```

## Stack

- **Monorepo:** pnpm workspaces + Turborepo, lint/format com **Biome**
- **`apps/api`:** Fastify 5 + `fastify-type-provider-zod` + `@fastify/swagger` + **Better Auth**
- **`apps/app`:** React + Vite + TanStack Router + TanStack Query + Tailwind
- **`packages/database`:** Prisma 7 (driver adapter `pg`) — **Postgres via [Neon](https://neon.tech), sem Docker**
- **`packages/api-client`:** Kubb gera `models/` (tipos) e `hooks/` a partir do OpenAPI
- **`packages/ui`:** design system (Button, Input, Label, Card) + preset Tailwind

## Pré-requisitos

- Node 20+ e pnpm 10+ (`npm i -g pnpm`)
- Um banco Postgres. Recomendado: crie um projeto grátis no **Neon** e copie a
  connection string. (Não precisa de Docker.)

## Como rodar

```bash
# 1. copie o .env e preencha o DATABASE_URL (Neon) e o BETTER_AUTH_SECRET
cp .env.example .env
#    gere um segredo: openssl rand -base64 32

# 2. instala, gera o Prisma Client, o OpenAPI e o api-client (Kubb)
pnpm setup

# 3. aplica a migration inicial no seu banco
pnpm db:migrate

# 4. sobe API (3333) e front (5173)
pnpm dev
```

Abra http://localhost:5173, crie uma conta em **/register** e você cai no
dashboard — cujos dados vêm do `GET /me` via o hook gerado `useGetMe`.

> **Docs interativa da API:** http://localhost:3333/reference (Scalar, só em dev).

## O fluxo do api-client (o coração do boilerplate)

1. Você cria um módulo em `apps/api/src/modules/<nome>/` com **`schemas.ts`**
   (Zod), **`service.ts`** (regra + banco) e **`route.ts`** (a rota, com `tags`
   e `response` schemas). Registre em `apps/api/src/routes.ts`.
2. `pnpm openapi` sobe o Fastify em memória e escreve `apps/api/openapi.yaml`.
3. `pnpm api-client` roda o Kubb, que lê o OpenAPI e regenera
   `packages/api-client/gen/` (models + hooks agrupados por tag).
4. No front, importe o hook: `import { useGetMe } from '@repo/api-client/hooks'`.

Sempre que mudar/adicionar rotas: **`pnpm openapi && pnpm api-client`** (ou
`pnpm --filter @repo/api-client dev` para regenerar em watch).

## Estrutura modular da API (exemplo `/me`)

```
apps/api/src/modules/me/
  schemas.ts   Zod → vira o tipo GetMe200 gerado pelo Kubb
  service.ts   MeService: fala com o Prisma (regra de negócio)
  route.ts     GET /me: valida sessão (Better Auth) e chama o service
```

A rota só orquestra; a regra fica no `service`; o `schema` é a fonte da verdade
dos tipos (API **e** client). Esse é o padrão que o curso ensina.

## Autenticação (Better Auth)

Montado em `/api/auth/*` (login, registro, sessão, logout). No front:

```ts
import { authClient, useSession } from '@/lib/auth-client'
await authClient.signIn.email({ email, password })
await authClient.signUp.email({ name, email, password })
const { data: session } = useSession()
```

Para proteger uma rota na API, veja `modules/me/route.ts`
(`services.auth.auth.api.getSession`). Ao ligar plugins do Better Auth
(organization, admin, 2FA, OAuth...): edite `modules/better-auth/configs.ts`,
rode `pnpm auth:generate` (atualiza o `schema.prisma`) e `pnpm db:migrate`.

## Scripts

| Comando             | O que faz                                                    |
| ------------------- | ------------------------------------------------------------ |
| `pnpm setup`        | install + gera Prisma Client + OpenAPI + api-client (Kubb)   |
| `pnpm dev`          | Sobe API + front em watch                                    |
| `pnpm build`        | Build de produção                                            |
| `pnpm typecheck`    | Checagem de tipos em todo o monorepo                         |
| `pnpm lint` / `:fix`| Biome (checagem / auto-fix)                                  |
| `pnpm openapi`      | Regera o `apps/api/openapi.yaml`                             |
| `pnpm api-client`   | Regera os hooks do Kubb                                      |
| `pnpm db:migrate`   | Cria/aplica migration (Prisma)                               |
| `pnpm db:studio`    | Abre o Prisma Studio                                         |
| `pnpm auth:generate`| Deriva o schema do Prisma a partir da config do Better Auth  |

## Rodando o Postgres localmente (opcional, sem Docker)

Se preferir não usar o Neon em dev, e tiver o Postgres instalado
(`brew install postgresql@16`):

```bash
createdb boilerplate
# no .env: DATABASE_URL="postgresql://<seu-usuario>@localhost:5432/boilerplate?sslmode=disable"
pnpm db:migrate
```
