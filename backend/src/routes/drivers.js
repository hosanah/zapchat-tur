const express = require('express');
const router = express.Router();
const DriverController = require('../controllers/DriverController');
const { driverValidations } = require('../middleware/driverValidations');
const { authenticate, authorize } = require('../middleware/auth');

// Aplicar autenticação a todas as rotas
router.use(authenticate);

// Obter motoristas ativos
router.get('/active', 
  driverValidations.validateQuery,
  DriverController.getActive
);

// Obter motoristas com CNH vencendo
router.get('/expiring-licenses', 
  driverValidations.validateQuery,
  DriverController.getExpiringLicenses
);

// Obter estatísticas dos motoristas
router.get('/stats', 
  driverValidations.validateQuery,
  DriverController.getStats
);

// Listar todos os motoristas
router.get('/', 
  driverValidations.validateQuery,
  DriverController.getAll
);

// Obter motorista por ID
router.get('/:id', 
  driverValidations.validateId,
  DriverController.getById
);

// Criar novo motorista
router.post('/', 
  authorize('master', 'admin'),
  driverValidations.create,
  DriverController.create
);

// Atualizar motorista
router.put('/:id', 
  authorize('master', 'admin'),
  driverValidations.validateId,
  driverValidations.update,
  DriverController.update
);

// Alterar status do motorista
router.patch('/:id/status', 
  authorize('master', 'admin'),
  driverValidations.validateId,
  DriverController.updateStatus
);

// Excluir motorista
router.delete('/:id', 
  authorize('master', 'admin'),
  driverValidations.validateId,
  DriverController.delete
);

module.exports = router;

