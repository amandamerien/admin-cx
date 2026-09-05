-- Log de entradas no painel: uma linha por login.
--
-- As sessões do Better Auth só guardam o que está vivo; ao sair ou expirar, a
-- linha some. Este registro fica.

CREATE TABLE "acessos_equipe" (
  "id"        UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId"    UUID,
  "nome"      TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "ip"        TEXT,
  "userAgent" TEXT,
  "criadoEm"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "acessos_equipe_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "acessos_equipe_criadoEm_idx" ON "acessos_equipe"("criadoEm");
CREATE INDEX "acessos_equipe_userId_idx" ON "acessos_equipe"("userId");

-- Conta excluída não apaga o histórico: o vínculo cai para nulo e o nome
-- copiado mantém o registro legível.
ALTER TABLE "acessos_equipe"
  ADD CONSTRAINT "acessos_equipe_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
