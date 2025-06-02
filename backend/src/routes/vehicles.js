const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/VehicleController');
const { vehicleValidations } = require('../middleware/vehicleValidations');
const { authenticate, authorize } = require('../middleware/auth');

// Aplicar autenticação a todas as rotas
router.use(authenticate);

// Obter veículos disponíveis
router.get('/available', 
  vehicleValidations.validateQuery,
  VehicleController.getAvailable
);

// Obter estatísticas dos veículos
router.get('/stats', 
  vehicleValidations.validateQuery,
  VehicleController.getStats
);

// Listar todos os veículos
router.get('/', 
  vehicleValidations.validateQuery,
  VehicleController.getAll
);

// Obter veículo por ID
router.get('/:id', 
  vehicleValidations.validateId,
  VehicleController.getById
);

// Criar novo veículo
router.post('/', 
  authorize('master', 'admin'),
  vehicleValidations.create,
  VehicleController.create
);

// Atualizar veículo
router.put('/:id', 
  authorize('master', 'admin'),
  vehicleValidations.validateId,
  vehicleValidations.update,
  VehicleController.update
);

// Alterar status do veículo
router.patch('/:id/status', 
  authorize('master', 'admin'),
  vehicleValidations.validateId,
  VehicleController.updateStatus
);

// Excluir veículo
router.delete('/:id', 
  authorize('master', 'admin'),
  vehicleValidations.validateId,
  VehicleController.delete
);

module.exports = router;

