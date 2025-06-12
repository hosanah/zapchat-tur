-- Adicionar campo lastActivity à tabela users
ALTER TABLE users ADD COLUMN last_activity TIMESTAMP;

-- Atualizar todos os usuários existentes com lastActivity igual a lastLogin ou agora
UPDATE users SET last_activity = COALESCE(last_login, CURRENT_TIMESTAMP);

-- Criar índice para melhorar performance de consultas por lastActivity
CREATE INDEX idx_users_last_activity ON users(last_activity);
