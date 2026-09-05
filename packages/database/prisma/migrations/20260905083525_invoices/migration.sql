-- Invoices emitidos pelo painel, para poderem ser reabertos e reexportados.

CREATE TABLE "invoices" (
  "id"        UUID NOT NULL DEFAULT gen_random_uuid(),
  "numero"    TEXT NOT NULL,
  "data"      DATE NOT NULL,
  "nome"      TEXT NOT NULL,
  "cpf"       TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "telefone"  TEXT NOT NULL,
  "endereco"  TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "invoices_createdAt_idx" ON "invoices"("createdAt");

CREATE TABLE "itens_invoice" (
  "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
  "invoiceId"  UUID NOT NULL,
  "fornecedor" TEXT NOT NULL,
  "quantidade" TEXT NOT NULL,
  "valor"      DECIMAL(12,2) NOT NULL,
  "ordem"      INTEGER NOT NULL,

  CONSTRAINT "itens_invoice_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "itens_invoice_invoiceId_idx" ON "itens_invoice"("invoiceId");

-- Apagar o invoice leva as linhas dele junto.
ALTER TABLE "itens_invoice"
  ADD CONSTRAINT "itens_invoice_invoiceId_fkey"
  FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
