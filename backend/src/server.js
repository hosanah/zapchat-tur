const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./config/database');
const { runMigrations } = require('./database/migrate');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3001;

// Confiança no primeiro proxy (NGINX, EasyPanel, etc)
app.set('trust proxy', 1);

// Segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Limite de requisições
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' }
});
app.use(limiter);

// Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ZapTur API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.send('API ZapChat Tur está rodando.');
});

// =========================
// Carregamento das Rotas
// =========================
try {
  console.log('✅ Carregando rotas...');

  const authRoutes = require('./routes/auth');
  const companyRoutes = require('./routes/companies');
  const userRoutes = require('./routes/users');
  const vehicleRoutes = require('./routes/vehicles');
  const driverRoutes = require('./routes/drivers');
  const customerRoutes = require('./routes/customers');
  const tripRoutes = require('./routes/trips');
  const bookingRoutes = require('./routes/bookings');
  const saleRoutes = require('./routes/sales');
  const activityRoutes = require('./routes/activities');
  const dashboardRoutes = require('./routes/dashboard');

  app.use('/api/auth', authRoutes);
  app.use('/api/companies', companyRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/drivers', driverRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/sales', saleRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  console.log('✅ Rotas carregadas com sucesso.');
} catch (err) {
  console.error('❌ Erro ao carregar rotas:', err.message);
}

// =========================
// Listagem das Rotas
// =========================
function listRoutes(app) {
  console.log('\n📌 Rotas registradas:\n');

  const getPath = (layer) => layer.route?.path || '';

  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
      console.log(`${methods.padEnd(10)} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      const baseUrl = middleware.regexp?.toString().split('\\')[1] || '';
      middleware.handle.stack.forEach((handler) => {
        const route = handler.route;
        if (route) {
          const methods = Object.keys(route.methods).join(', ').toUpperCase();
          console.log(`${methods.padEnd(10)} /${baseUrl}${route.path}`);
        }
      });
    }
  });
}

// Erros
app.use(notFound);
app.use(errorHandler);

// Inicialização do servidor
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso.');

    if (process.env.NODE_ENV === 'development' && process.env.DB_RECREATE_FORCE === 'true') {
      await sequelize.sync({ force: true });
      console.log('✅ Modelos sincronizados com o banco de dados.');
    }

    await runMigrations();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      listRoutes(app); // <- mostra as rotas após iniciar
    });

    const shutdown = (signal) => {
      console.log(`🛑 ${signal} recebido. Encerrando servidor...`);
      server.close(() => {
        console.log('✅ Servidor encerrado.');
        sequelize.close();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    setInterval(() => {}, 1000 * 60 * 60); // evitar que o container finalize
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
