-- Etapas e status do funil trocados pelas listas definidas pelo time.
--
-- Postgres não deixa remover valor de enum em uso, então o caminho é criar o
-- tipo novo, converter a coluna com um de-para e só então descartar o antigo.
-- Sem o de-para, os funis já cadastrados perderiam etapa e status.

-- ── Status ────────────────────────────────────────────────────
CREATE TYPE "ColunaPipeline_new" AS ENUM (
  'nao_iniciado',
  'em_andamento',
  'aguardando_cliente',
  'em_revisao',
  'bloqueado',
  'concluido'
);

ALTER TABLE "funis" ALTER COLUMN "status" DROP DEFAULT;

-- backlog e todo viram "não iniciado": nos dois o trabalho ainda não começou.
ALTER TABLE "funis"
  ALTER COLUMN "status" TYPE "ColunaPipeline_new"
  USING (
    CASE "status"::text
      WHEN 'backlog'      THEN 'nao_iniciado'
      WHEN 'todo'         THEN 'nao_iniciado'
      WHEN 'em_progresso' THEN 'em_andamento'
      WHEN 'completo'     THEN 'concluido'
      ELSE 'nao_iniciado'
    END
  )::"ColunaPipeline_new";

ALTER TABLE "funis" ALTER COLUMN "status" SET DEFAULT 'nao_iniciado';

DROP TYPE "ColunaPipeline";
ALTER TYPE "ColunaPipeline_new" RENAME TO "ColunaPipeline";

-- ── Etapas ────────────────────────────────────────────────────
CREATE TYPE "EtapaFunil_new" AS ENUM (
  'onboarding',
  'briefing_diagnostico',
  'estrategia',
  'copy',
  'design',
  'construcao_funil',
  'pipeline',
  'automacoes',
  'testes_revisao',
  'publicacao'
);

ALTER TABLE "funis" ALTER COLUMN "etapa" DROP DEFAULT;

-- As três renomeadas; onboarding, design e pipeline seguem com o mesmo nome.
ALTER TABLE "funis"
  ALTER COLUMN "etapa" TYPE "EtapaFunil_new"
  USING (
    CASE "etapa"::text
      WHEN 'briefing'  THEN 'briefing_diagnostico'
      WHEN 'funil'     THEN 'construcao_funil'
      WHEN 'automacao' THEN 'automacoes'
      ELSE "etapa"::text
    END
  )::"EtapaFunil_new";

ALTER TABLE "funis" ALTER COLUMN "etapa" SET DEFAULT 'onboarding';

DROP TYPE "EtapaFunil";
ALTER TYPE "EtapaFunil_new" RENAME TO "EtapaFunil";
