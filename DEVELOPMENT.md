# Comandos de Desenvolvimento - ZapChat Tur

## Backend (Node.js + Express)

### Instalação
```bash
cd backend
npm install
```

### Desenvolvimento
```bash
# Iniciar servidor em modo desenvolvimento (com nodemon)
npm run dev

# Iniciar servidor em modo produção
npm start

# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

### Banco de Dados
```bash
# O banco SQLite será criado automaticamente em:
# backend/database/zapchat_tur_dev.sqlite

# Para popular com dados iniciais, execute o seeder:
node -e "require('./src/database/seeders').seedDatabase()"
```

## Frontend (React + Vite)

### Instalação
```bash
cd frontend
npm install
```

### Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Iniciar servidor de desenvolvimento com acesso externo
npm run dev --host

# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

## Execução Completa

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
pnpm run dev
```

## URLs de Acesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Credenciais de Teste

Após executar o seeder, você pode usar estas credenciais:

### Usuário Master
- **Email**: admin@zapchattur.com
- **Senha**: admin123456
- **Acesso**: Todas as empresas

### Usuário Admin da Empresa
- **Email**: joao@turismoexemplo.com.br
- **Senha**: senha123456
- **Acesso**: Apenas empresa "Turismo Exemplo Ltda"

### Usuário Comum
- **Email**: maria@turismoexemplo.com.br
- **Senha**: senha123456
- **Acesso**: Apenas empresa "Turismo Exemplo Ltda"

## Estrutura de Arquivos

```
zapchat-tur/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações (DB, etc)
│   │   ├── controllers/     # Controladores da API
│   │   ├── middleware/      # Middlewares personalizados
│   │   ├── models/          # Modelos do Sequelize
│   │   ├── routes/          # Rotas da API
│   │   ├── utils/           # Utilitários
│   │   ├── database/        # Seeders e migrations
│   │   └── server.js        # Servidor principal
│   ├── tests/               # Testes automatizados
│   ├── database/            # Arquivos do banco SQLite
│   ├── .env                 # Variáveis de ambiente
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilitários
│   │   ├── assets/          # Imagens e arquivos estáticos
│   │   ├── App.jsx          # Componente principal
│   │   └── main.jsx         # Entry point
│   ├── public/              # Arquivos públicos
│   └── package.json
├── docs/                    # Documentação
└── README.md               # Este arquivo
```

## Paleta de Cores

- **#99CD85** - Verde claro principal
- **#CFE0BC** - Verde muito claro (backgrounds)
- **#7FA653** - Verde médio (botões e interações)
- **#63783D** - Verde escuro (textos e contrastes)
- **#1C2B20** - Verde muito escuro (menus e headers)

## Próximos Passos

A **Sprint 1** foi concluída com sucesso! Próximas implementações:

1. **Sprint 2**: API completa e endpoints funcionais
2. **Sprint 3**: Sistema de autenticação JWT
3. **Sprint 4**: Interface de usuário completa
4. **Sprint 5**: Lógica multi-tenant no frontend
5. **Sprint 6**: Testes e validação
6. **Sprint 7**: Deploy e entrega final

