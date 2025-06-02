# ZapChat Tur

Sistema multi-tenant de gestão turística desenvolvido com Node.js (backend) e React (frontend).

## 🚀 Características

- **Arquitetura Multi-tenant**: Isolamento completo de dados por empresa
- **Autenticação JWT**: Sistema seguro de login e autorização
- **Interface Responsiva**: Design moderno adaptável a todos os dispositivos
- **Usuários Master e Comuns**: Diferentes níveis de acesso e permissões
- **Agenda de Eventos**: Planejamento e acompanhamento de atividades
- **Relatórios Gerenciais**: Insights e métricas por empresa

## 🎨 Paleta de Cores

- **#99CD85** - Verde claro principal
- **#CFE0BC** - Verde muito claro (backgrounds)
- **#7FA653** - Verde médio (botões e interações)
- **#63783D** - Verde escuro (textos e contrastes)
- **#1C2B20** - Verde muito escuro (menus e headers)

## 🏗️ Estrutura do Projeto

```
zapchat-tur/
├── backend/          # API Node.js
├── frontend/         # Interface React
├── docs/            # Documentação
└── README.md        # Este arquivo
```

## 🛠️ Tecnologias

### Backend
- Node.js
- Express.js
- JWT (JSON Web Tokens)
- Banco de dados (a definir)

### Frontend
- React
- React Router
- Componentes responsivos
- CSS moderno

## 📋 Funcionalidades Principais

### Gestão Multi-tenant
- Cadastro e gestão de empresas
- Isolamento automático de dados
- Usuários master com acesso global
- Usuários comuns com acesso restrito

### Módulos do Sistema
- **Empresas**: Cadastro e gestão de organizações
- **Usuários**: Controle de acesso e permissões
- **Veículos**: Gestão da frota
- **Motoristas**: Cadastro e alocação
- **Passeios**: Planejamento de roteiros
- **Eventos**: Agenda e cronograma
- **Clientes**: Base de dados de clientes
- **Vendas**: Controle financeiro

## 🚦 Status do Desenvolvimento

### ✅ Sprint 1: Planejamento e estrutura inicial
- [x] Documentação técnica
- [x] Estrutura de diretórios
- [ ] Configuração do ambiente

### 🔄 Próximas Sprints
- Sprint 2: Backend - API base e banco de dados
- Sprint 3: Sistema de autenticação multi-tenant
- Sprint 4: Frontend - Interface base
- Sprint 5: Lógica multi-tenant no frontend
- Sprint 6: Testes e validação
- Sprint 7: Deploy e entrega

## 🔧 Desenvolvimento

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Banco de dados (a configurar)

### Instalação
```bash
# Clone o repositório
git clone [url-do-repositorio]

# Entre no diretório
cd zapchat-tur

# Instale dependências do backend
cd backend
npm install

# Instale dependências do frontend
cd ../frontend
npm install
```

### Execução
```bash
# Backend (porta 3001)
cd backend
npm run dev

# Frontend (porta 3000)
cd frontend
npm start
```

## 📚 Documentação

- [Documentação Técnica](docs/zapchat-tur-docs.md)
- [Lista de Tarefas](docs/todo.md)

## 🤝 Contribuição

Este projeto está sendo desenvolvido em sprints com entregas incrementais. Cada funcionalidade é testada e validada antes do avanço para a próxima sprint.

## 📄 Licença

[Definir licença]

---

**ZapChat Tur** - Sistema de gestão turística multi-tenant

