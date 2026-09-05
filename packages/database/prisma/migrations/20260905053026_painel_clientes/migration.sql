-- CreateEnum
CREATE TYPE "StatusCliente" AS ENUM ('ativo', 'onboarding', 'em_risco', 'inativo');

-- CreateEnum
CREATE TYPE "ColunaPipeline" AS ENUM ('backlog', 'todo', 'em_progresso', 'completo');

-- CreateEnum
CREATE TYPE "EtapaFunil" AS ENUM ('onboarding', 'briefing', 'design', 'funil', 'automacao', 'pipeline');

-- CreateEnum
CREATE TYPE "TipoArquivo" AS ENUM ('drive', 'docs', 'sheets', 'slides', 'figma', 'notion', 'canva', 'dropbox', 'loom', 'outro');

-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('administrador', 'editor', 'visualizador');

-- CreateEnum
CREATE TYPE "AvatarId" AS ENUM ('estrela', 'espinho', 'losango', 'capsula', 'gota', 'coracao', 'bolha');

-- CreateEnum
CREATE TYPE "GrupoChecklist" AS ENUM ('base', 'produtos', 'publico', 'empresa', 'paginas', 'campanhas', 'ferramentas', 'objetivo');

-- CreateEnum
CREATE TYPE "TipoAnotacao" AS ENUM ('postit', 'emoji', 'comentario');

-- CreateEnum
CREATE TYPE "CorAnotacao" AS ENUM ('amarelo', 'rosa', 'azul', 'verde', 'roxo', 'laranja');

-- CreateTable
CREATE TABLE "administradores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "email" TEXT,
    "papel" "Papel" NOT NULL DEFAULT 'visualizador',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "avatar" "AvatarId" NOT NULL DEFAULT 'estrela',
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "StatusCliente" NOT NULL DEFAULT 'onboarding',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funis" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clienteId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "etapa" "EtapaFunil" NOT NULL DEFAULT 'onboarding',
    "status" "ColunaPipeline" NOT NULL DEFAULT 'backlog',
    "responsavel" TEXT NOT NULL,
    "dataEntrega" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arquivos_cliente" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clienteId" UUID NOT NULL,
    "tipo" "TipoArquivo" NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arquivos_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acessos_cliente" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clienteId" UUID NOT NULL,
    "plataforma" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acessos_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_cliente" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clienteId" UUID NOT NULL,
    "autorId" UUID,
    "autor" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_checklist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clienteId" UUID NOT NULL,
    "grupo" "GrupoChecklist" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "recebido" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "ordem" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anotacoes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tipo" "TipoAnotacao" NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "texto" TEXT NOT NULL,
    "cor" "CorAnotacao" NOT NULL DEFAULT 'amarelo',
    "autorId" UUID,
    "autor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anotacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administradores_email_key" ON "administradores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "administradores_userId_key" ON "administradores"("userId");

-- CreateIndex
CREATE INDEX "clientes_status_idx" ON "clientes"("status");

-- CreateIndex
CREATE INDEX "funis_clienteId_idx" ON "funis"("clienteId");

-- CreateIndex
CREATE INDEX "funis_status_idx" ON "funis"("status");

-- CreateIndex
CREATE INDEX "arquivos_cliente_clienteId_idx" ON "arquivos_cliente"("clienteId");

-- CreateIndex
CREATE INDEX "acessos_cliente_clienteId_idx" ON "acessos_cliente"("clienteId");

-- CreateIndex
CREATE INDEX "notas_cliente_clienteId_idx" ON "notas_cliente"("clienteId");

-- CreateIndex
CREATE INDEX "itens_checklist_clienteId_idx" ON "itens_checklist"("clienteId");

-- AddForeignKey
ALTER TABLE "administradores" ADD CONSTRAINT "administradores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funis" ADD CONSTRAINT "funis_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arquivos_cliente" ADD CONSTRAINT "arquivos_cliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acessos_cliente" ADD CONSTRAINT "acessos_cliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_cliente" ADD CONSTRAINT "notas_cliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_cliente" ADD CONSTRAINT "notas_cliente_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "administradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_checklist" ADD CONSTRAINT "itens_checklist_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anotacoes" ADD CONSTRAINT "anotacoes_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "administradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
