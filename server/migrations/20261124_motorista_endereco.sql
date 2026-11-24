-- Endereço opcional do motorista; mantém os registros existentes.
ALTER TABLE motorista ADD COLUMN IF NOT EXISTS endereco VARCHAR(500);
