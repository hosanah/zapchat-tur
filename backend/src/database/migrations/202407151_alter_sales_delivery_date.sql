-- Alterar coluna delivery_date para DATETIME
-- Cria nova coluna temporária
ALTER TABLE sales ADD COLUMN delivery_date_new DATETIME;
-- Copia os valores existentes
UPDATE sales SET delivery_date_new = delivery_date;
-- Remove a coluna antiga
ALTER TABLE sales DROP COLUMN delivery_date;
-- Renomeia a nova coluna
ALTER TABLE sales RENAME COLUMN delivery_date_new TO delivery_date;
