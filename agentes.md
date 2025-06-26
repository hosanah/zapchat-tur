# ZapChat Tur - Visão Geral

Este documento resume a arquitetura atual do projeto e serve de referência aos colaboradores. Atualize-o sempre que tarefas significativas forem concluídas.

## Backend Node.js/Express

- **Estrutura Multi-tenant**: todas as entidades principais incluem o campo `company_id`. Middlewares de autenticação e autorização garantem que usuários só acessem dados de sua empresa, exceto usuários com papel `master` que possuem acesso global.
- **Banco de Dados**: utiliza Sequelize com SQLite em desenvolvimento (`backend/src/config/database.js`) e PostgreSQL em produção. O script `initializeDatabase` executa migrations e seeders quando configurado.
- **Autenticação**: baseada em JWT com tokens de acesso e refresh (`backend/src/utils/jwtUtils.js`). O middleware `authenticate` valida o token, carrega o usuário e verifica inatividade.
- **Modelos e Relacionamentos**: entre as entidades principais estão `Company`, `User`, `Vehicle`, `Driver`, `Customer`, `Trip`, `Booking`, `Sale`, `Accessory`, `GeneralSetting` e `Notification` (veja `backend/src/models`). As associações são definidas em `backend/src/models/index.js`.
- **Rotas da API**: agrupadas por recurso em `backend/src/routes`. Incluem `/auth`, `/companies`, `/users`, `/vehicles`, `/drivers`, `/customers`, `/trips`, `/bookings`, `/sales`, `/accessories`, `/dashboard`, `/settings` e `/notifications`.

## Frontend React

- **Stack**: criado com Vite e React 18. Utiliza React Router para navegação e Tailwind CSS para estilos. Diversos componentes Radix UI e outras bibliotecas modernas são listados em `frontend/package.json`.
- **Integração com a API**: a pasta `frontend/src/services` centraliza chamadas via Axios. Interceptores tratam tokens de acesso e refresh, replicando o fluxo de autenticação do backend.
- **Gerenciamento de Estado**: o contexto `AuthContext` lida com login, logout e permissões, enquanto o layout e páginas dentro de `frontend/src/pages` consomem os serviços de API.

## Desenvolvimento

Os comandos para instalar dependências, rodar servidores e executar testes estão documentados em `DEVELOPMENT.md`. Consulte-o para detalhes sobre como iniciar o backend e o frontend durante o desenvolvimento.

## Metodologia de Trabalho

O projeto evolui em sprints conforme descrito em `docs/todo.md`. Cada sprint possui metas específicas: o planejamento inicial foi finalizado na Sprint 1 e as próximas etapas incluem evolução da API, autenticação, implementação da interface e testes.

