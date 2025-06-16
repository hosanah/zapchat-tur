const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

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
const activityRoutes = require('./routes/activities');
const dashboardRoutes = require('./routes/dashboard');

// Middlewares
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
// const { authenticateJWT } = require('./middleware/auth'); // se for usar rotas protegidas

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Segurança
app.use(helmet());

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
};
app.use(cors(corsOptions));

// Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Arquivos públicos
const uploadsPath = path.resolve(process.cwd(), 'public/uploads');
app.use('/uploads', express.static(uploadsPath));
app.use(express.static(path.resolve(process.cwd(), 'public')));

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Rota base
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API' });
});

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas (exemplo: use auth middleware se necessário)
// app.use('/api/companies', authenticateJWT, companyRoutes);
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

// Erros
app.use(notFound);
app.use(errorHandler);

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
