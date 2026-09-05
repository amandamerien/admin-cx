-- CreateEnum
CREATE TYPE "PlanoCliente" AS ENUM ('growth', 'profissional', 'business');

-- CreateEnum
CREATE TYPE "CicloPlano" AS ENUM ('mensal', 'anual');

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "cicloPlano" "CicloPlano",
ADD COLUMN     "plano" "PlanoCliente";
