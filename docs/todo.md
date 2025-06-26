# ZapChat Tur - Lista de Tarefas

## Sprint 1: Planejamento e estrutura inicial do projeto

### Planejamento e Documentação
- [x] Criar documentação técnica do projeto
- [x] Definir estrutura de diretórios do projeto
- [x] Criar estrutura do backend (Node.js)
- [x] Criar estrutura do frontend (React)
- [x] Definir esquema do banco de dados
- [x] Configurar ambiente de desenvolvimento

### Estrutura do Projeto
- [x] Criar diretório raiz do projeto
- [x] Configurar package.json para o backend
- [x] Configurar package.json para o frontend
- [x] Definir scripts de desenvolvimento
- [x] Configurar variáveis de ambiente

### Banco de Dados
- [x] Definir modelo de dados para empresas
- [x] Definir modelo de dados para usuários
- [x] Criar migrations iniciais
- [x] Configurar conexão com banco de dados
- [x] Implementar seeders básicos

### Configurações Iniciais
- [x] Configurar ESLint e Prettier
- [x] Configurar estrutura de pastas do backend
- [x] Configurar estrutura de pastas do frontend
- [x] Documentar comandos de desenvolvimento
- [x] Validar estrutura inicial

## Sprint 2: Desenvolvimento do backend - API base e banco de dados

### API Base
- [x] Configurar Express.js
- [x] Implementar middleware básico
- [x] Configurar CORS
- [x] Implementar tratamento de erros
- [x] Configurar logging

### Modelos de Dados
- [x] Implementar modelo Company
- [x] Implementar modelo User
- [x] Configurar relacionamentos
- [x] Implementar validações
- [x] Testar modelos

### Endpoints Básicos
- [x] Endpoint para cadastro de empresas
- [x] Endpoint para listagem de empresas
- [x] Endpoint para cadastro de usuários
- [x] Endpoint para listagem de usuários
- [x] Validar endpoints com testes

## Sprint 3: Sistema de autenticação e autorização multi-tenant

### Autenticação
- [x] Implementar login com email/senha
- [x] Configurar JWT
- [x] Implementar middleware de autenticação
- [x] Implementar refresh tokens
- [x] Testar fluxo de autenticação

### Autorização Multi-tenant
- [x] Implementar middleware de tenant
- [x] Configurar filtros por empresa
- [x] Implementar permissões de usuário master
- [x] Implementar permissões de usuário comum
- [x] Validar isolamento de dados

## Sprint 4: Desenvolvimento do frontend - Interface base e autenticação

### Estrutura React
- [ ] Configurar React com template
- [ ] Implementar roteamento
- [ ] Configurar gerenciamento de estado
- [ ] Implementar componentes base
- [ ] Aplicar paleta de cores

### Interface de Autenticação
- [ ] Criar tela de login
- [ ] Criar tela de cadastro de empresa
- [ ] Criar tela de cadastro de usuário
- [ ] Implementar validações de formulário
- [ ] Testar responsividade

## Sprint 5: Implementação da lógica multi-tenant no frontend

### Proteção de Rotas
- [ ] Implementar guards de autenticação
- [ ] Implementar guards de autorização
- [ ] Configurar redirecionamentos
- [ ] Implementar contexto de usuário
- [ ] Testar proteções

### Interface Multi-tenant
- [ ] Implementar seleção de empresa (master)
- [ ] Configurar filtros por empresa
- [ ] Implementar dashboard básico
- [ ] Criar navegação contextual
- [ ] Validar experiência do usuário

## Sprint 6: Testes e validação do sistema completo

### Testes Backend
- [ ] Testes unitários dos modelos
- [ ] Testes de integração da API
- [ ] Testes de autenticação
- [ ] Testes de autorização
- [ ] Testes de isolamento multi-tenant
- [ ] Validar armazenamento e exibição do horário do passeio nas vendas

### Testes Frontend
- [ ] Testes de componentes
- [ ] Testes de integração
- [ ] Testes de fluxos de usuário
- [ ] Testes de responsividade
- [ ] Validação cross-browser

## Sprint 7: Deploy e entrega final do sistema

### Preparação para Deploy
- [ ] Configurar variáveis de produção
- [ ] Otimizar build do frontend
- [ ] Configurar banco de produção
- [ ] Implementar logs de produção
- [ ] Documentar processo de deploy

### Deploy e Validação
- [ ] Deploy do backend
- [ ] Deploy do frontend
- [ ] Testes em produção
- [ ] Validação final com usuário
- [ ] Documentação de uso

