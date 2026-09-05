-- Quantas entregas o cliente contratou, para a ficha mostrar o progresso.
-- Zero é o padrão: quem não tem número combinado simplesmente não mostra meta.
ALTER TABLE "clientes" ADD COLUMN "funisContratados" INTEGER NOT NULL DEFAULT 0;
