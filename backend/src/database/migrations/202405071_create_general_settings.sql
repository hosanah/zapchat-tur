-- Criar tabela de configurações gerais por empresa
CREATE TABLE IF NOT EXISTS general_settings (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  logo BLOB,
  guidelines TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_general_settings_company ON general_settings(company_id);
