const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Importar rotas
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const userRoutes = require('./routes/users');
const vehicleRoutes = require('./routes/vehicles');
const driverRoutes = require('./routes/drivers');
const customerRoutes = require('./routes/customers');
const tripRoutes = require('./routes/trips');
const bookingRoutes = require('./routes/bookings');
const eventRoutes = require('./routes/events');
const saleRoutes = require('./routes/sales');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());

// Configuração CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.'
  }
});
app.use(limiter);

// Middleware de logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ZapChat Tur API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Configurar rotas
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/sales', saleRoutes);

// Middleware de tratamento de erros
app.use(notFound);
app.use(errorHandler);

// Função para inicializar o servidor
async function startServer() {
  try {
    // Conectar ao banco de dados
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso.');

    // Sincronizar modelos (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development' && process.env.DB_RECREATE_FORCE === 'true') {
      await sequelize.sync({ force: true });
      console.log('✅ Modelos sincronizados com o banco de dados.');
    }

    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM recebido. Encerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor encerrado.');
        sequelize.close();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT recebido. Encerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor encerrado.');
        sequelize.close();
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Inicializar servidor apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };

