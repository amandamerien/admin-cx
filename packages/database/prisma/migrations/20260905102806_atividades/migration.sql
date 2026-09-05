-- Feed do que acontece no painel.
CREATE TABLE "atividades" (
  "id"        UUID NOT NULL DEFAULT gen_random_uuid(),
  "autorId"   UUID,
  "autorNome" TEXT NOT NULL,
  "acao"      TEXT NOT NULL,
  "alvo"      TEXT NOT NULL,
  "detalhe"   TEXT,
  "criadoEm"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "atividades_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "atividades_criadoEm_idx" ON "atividades"("criadoEm");

-- Quem sai da equipe não apaga o histórico: o vínculo cai, o nome copiado fica.
ALTER TABLE "atividades"
  ADD CONSTRAINT "atividades_autorId_fkey"
  FOREIGN KEY ("autorId") REFERENCES "administradores"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
