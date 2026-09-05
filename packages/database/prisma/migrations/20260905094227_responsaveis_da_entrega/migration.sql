-- Uma entrega passa a poder ter mais de um responsável.
--
-- O nome que estava na coluna antiga vira o primeiro item da lista; nada se
-- perde. Entrega sem responsável fica com a lista vazia.

ALTER TABLE "funis" ADD COLUMN "responsaveis" TEXT[] NOT NULL DEFAULT '{}';

UPDATE "funis"
   SET "responsaveis" = ARRAY["responsavel"]
 WHERE "responsavel" IS NOT NULL
   AND "responsavel" <> '';

ALTER TABLE "funis" DROP COLUMN "responsavel";
ALTER TABLE "funis" ALTER COLUMN "responsaveis" DROP DEFAULT;
