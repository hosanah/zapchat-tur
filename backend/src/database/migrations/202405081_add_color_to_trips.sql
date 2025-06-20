-- Adicionar coluna color à tabela trips
ALTER TABLE trips ADD COLUMN color VARCHAR(7) DEFAULT '#99CD85';

-- Garantir valor padrão em registros existentes
UPDATE trips SET color = '#99CD85' WHERE color IS NULL;
