-- Tabela de acessórios
CREATE TABLE IF NOT EXISTS accessories (
  id uuid PRIMARY KEY,
  name TEXT NOT NULL,
  value REAL NOT NULL DEFAULT 0,
  description TEXT,
  company_id uuid NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX idx_accessories_company ON accessories(company_id);
CREATE INDEX idx_accessories_name ON accessories(name);

-- Tabela de relacionamento venda <-> acessório
CREATE TABLE IF NOT EXISTS sale_accessories (
  id uuid PRIMARY KEY,
  sale_id uuid NOT NULL,
  accessory_id uuid NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (accessory_id) REFERENCES accessories(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX idx_sale_accessories_sale ON sale_accessories(sale_id);
CREATE INDEX idx_sale_accessories_accessory ON sale_accessories(accessory_id);
