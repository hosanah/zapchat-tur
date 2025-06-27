const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { initializeDatabase } = require('./config/database');

dotenv.config();

const { sequelize } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Rotas
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const userRoutes = require('./routes/users');
const vehicleRoutes = require('./routes/vehicles');
const driverRoutes = require('./routes/drivers');
const customerRoutes = require('./routes/customers');
const tripRoutes = require('./routes/trips');
const bookingRoutes = require('./routes/bookings');
const saleRoutes = require('./routes/sales');
const accessoryRoutes = require('./routes/accessories');
const activityRoutes = require('./routes/activities');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;

// Segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Página base
app.get('/', (req, res) => {
  res.send('🚀 API do ZapChat Tur está no ar.');
});

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas (adicione auth middleware se necessário)
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/accessories', accessoryRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);

// Middlewares de erro
app.use(notFound);
app.use(errorHandler);

// Inicialização do servidor
async function startServer() {
  try {
    await initializeDatabase();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
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

    // Previne encerramento precoce em containers
    setInterval(() => {}, 1000 * 60 * 60);
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Inicia o servidor (exceto em testes)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
