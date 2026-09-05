-- Mais um lugar onde o material do cliente pode morar.
-- ADD VALUE em enum é aditivo: nada do que já existe é tocado.
ALTER TYPE "TipoArquivo" ADD VALUE IF NOT EXISTS 'claude' BEFORE 'outro';
