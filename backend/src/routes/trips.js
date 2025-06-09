const express = require('express');
const router = express.Router();
const TripController = require('../controllers/TripController');
const { authenticate, authorize } = require('../middleware/auth');
const { tripValidations } = require('../middleware/tripValidations');

// Aplicar autenticação a todas as rotas
router.use(authenticate);

/**
 * @route GET /api/trips
 * @desc Listar todos os passeios
 * @access Private (Master, Admin, User)
 */
router.get('/', 
  tripValidations.validateQuery,
  TripController.getAll
);

/**
 * @route GET /api/trips/active
 * @desc Obter passeios ativos
 * @access Private (Master, Admin, User)
 */
router.get('/active',
  tripValidations.validateQuery,
  TripController.getActive
);

/**
 * @route GET /api/trips/upcoming
 * @desc Obter passeios próximos
 * @access Private (Master, Admin, User)
 */
router.get('/upcoming',
  tripValidations.validateQuery,
  TripController.getUpcoming
);

/**
 * @route GET /api/trips/available
 * @desc Obter passeios disponíveis
 * @access Private (Master, Admin, User)
 */
router.get('/available',
  tripValidations.validateQuery,
  TripController.getAvailable
);

/**
 * @route GET /api/trips/stats
 * @desc Obter estatísticas dos passeios
 * @access Private (Master, Admin, User)
 */
router.get('/stats',
  tripValidations.validateQuery,
  TripController.getStats
);

/**
 * @route GET /api/trips/revenue
 * @desc Obter receita por período
 * @access Private (Master, Admin, User)
 */
router.get('/revenue',
  tripValidations.validateQuery,
  TripController.getRevenue
);

/**
 * @route GET /api/trips/:id
 * @desc Obter passeio por ID
 * @access Private (Master, Admin, User)
 */
router.get('/:id',
  tripValidations.validateId,
  TripController.getById
);

/**
 * @route POST /api/trips
 * @desc Criar novo passeio
 * @access Private (Master, Admin)
 */
router.post('/',
  tripValidations.create,
  TripController.create
);

/**
 * @route PUT /api/trips/:id
 * @desc Atualizar passeio
 * @access Private (Master, Admin)
 */
router.put('/:id',
  tripValidations.validateId,
  tripValidations.update,
  TripController.update
);

/**
 * @route PATCH /api/trips/:id/status
 * @desc Alterar status do passeio
 * @access Private (Master, Admin)
 */
router.patch('/:id/status',
  tripValidations.validateId,
  TripController.updateStatus
);

/**
 * @route DELETE /api/trips/:id
 * @desc Excluir passeio
 * @access Private (Master, Admin)
 */
router.delete('/:id',
  tripValidations.validateId,
  TripController.delete
);

module.exports = router;

