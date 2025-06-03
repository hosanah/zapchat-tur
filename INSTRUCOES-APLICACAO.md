# 📦 Instruções de Aplicação - Módulo de Vendas

## 🚀 **Como Aplicar as Modificações**

### **1. Arquivos Novos (Criar)**

#### **Backend:**
- `backend/src/models/Sale.js` - Modelo de vendas
- `backend/src/controllers/SaleController.js` - Controlador CRUD
- `backend/src/middleware/saleValidations.js` - Validações
- `backend/src/routes/sales.js` - Rotas da API

#### **Frontend:**
- `frontend/src/pages/sales/Sales.jsx` - Página de gerenciamento

### **2. Arquivos Modificados (Substituir)**

#### **Backend:**
- `backend/src/models/index.js` - Relacionamentos adicionados
- `backend/src/server.js` - Rotas de vendas registradas

#### **Frontend:**
- `frontend/src/App.jsx` - Rota /sales adicionada
- `frontend/src/components/layout/ModernLayout.jsx` - Menu atualizado

## 🔧 **Passos de Instalação**

### **1. Extrair Arquivos**
```bash
unzip zapchat-tur-modulo-vendas.zip
```

### **2. Copiar para o Projeto**
```bash
# Backend - Arquivos novos
cp modulo-vendas/backend/src/models/Sale.js zapchat-tur/backend/src/models/
cp modulo-vendas/backend/src/controllers/SaleController.js zapchat-tur/backend/src/controllers/
cp modulo-vendas/backend/src/middleware/saleValidations.js zapchat-tur/backend/src/middleware/
cp modulo-vendas/backend/src/routes/sales.js zapchat-tur/backend/src/routes/

# Backend - Arquivos modificados
cp modulo-vendas/backend/src/models/index.js zapchat-tur/backend/src/models/
cp modulo-vendas/backend/src/server.js zapchat-tur/backend/src/

# Frontend - Arquivos novos
mkdir -p zapchat-tur/frontend/src/pages/sales
cp modulo-vendas/frontend/src/pages/sales/Sales.jsx zapchat-tur/frontend/src/pages/sales/

# Frontend - Arquivos modificados
cp modulo-vendas/frontend/src/App.jsx zapchat-tur/frontend/src/
cp modulo-vendas/frontend/src/components/layout/ModernLayout.jsx zapchat-tur/frontend/src/components/layout/
```

### **3. Reiniciar Servidores**
```bash
# Backend
cd zapchat-tur/backend
npm install  # Se necessário
node src/server.js

# Frontend (nova sessão)
cd zapchat-tur/frontend
npm install  # Se necessário
npm run dev
```

## 🎯 **Verificação**

### **1. Backend**
- ✅ Servidor inicia sem erros
- ✅ Tabela `sales` criada no banco
- ✅ Endpoints `/api/sales` funcionando

### **2. Frontend**
- ✅ Aplicação carrega sem erros
- ✅ Menu "Vendas" aparece na sidebar
- ✅ Página `/sales` acessível

## 📊 **Endpoints da API**

```
GET    /api/sales           - Listar vendas
POST   /api/sales           - Criar venda
GET    /api/sales/:id       - Buscar venda
PUT    /api/sales/:id       - Atualizar venda
DELETE /api/sales/:id       - Excluir venda
GET    /api/sales/stats     - Estatísticas
```

## 🔐 **Permissões**

- **Usuário Master**: Acesso a todas as vendas
- **Usuário Comum**: Apenas vendas da própria empresa
- **Filtros automáticos** aplicados por empresa

## ✅ **Resultado Final**

Após aplicar as modificações, o sistema terá:
- 💰 **Módulo de vendas** completo e funcional
- 🎨 **Interface moderna** com CRUD completo
- 📊 **Estatísticas** e relatórios
- 🔐 **Regras de permissão** multi-tenant
- 🔗 **Relacionamentos** com clientes e eventos

**O módulo está pronto para uso em produção!**

