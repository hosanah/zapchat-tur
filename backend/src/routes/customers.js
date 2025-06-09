const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController');
const { authenticate, authorize } = require('../middleware/auth');
const { customerValidations } = require('../middleware/customerValidations');

// Aplicar autenticação a todas as rotas
router.use(authenticate);

/**
 * @route GET /api/customers
 * @desc Listar todos os clientes
 * @access Private (Master, Admin, User)
 */
router.get('/', 
  customerValidations.validateQuery,
  CustomerController.getAll
);

/**
 * @route GET /api/customers/active
 * @desc Obter clientes ativos
 * @access Private (Master, Admin, User)
 */
router.get('/active',
  customerValidations.validateQuery,
  CustomerController.getActive
);

/**
 * @route GET /api/customers/recent
 * @desc Obter clientes recentes
 * @access Private (Master, Admin, User)
 */
router.get('/recent',
  customerValidations.validateQuery,
  CustomerController.getRecent
);

/**
 * @route GET /api/customers/top
 * @desc Obter top clientes
 * @access Private (Master, Admin, User)
 */
router.get('/top',
  customerValidations.validateQuery,
  CustomerController.getTop
);

/**
 * @route GET /api/customers/stats
 * @desc Obter estatísticas dos clientes
 * @access Private (Master, Admin, User)
 */
router.get('/stats',
  customerValidations.validateQuery,
  CustomerController.getStats
);

/**
 * @route GET /api/customers/:id
 * @desc Obter cliente por ID
 * @access Private (Master, Admin, User)
 */
router.get('/:id',
  customerValidations.validateId,
  CustomerController.getById
);

/**
 * @route POST /api/customers
 * @desc Criar novo cliente
 * @access Private (Master, Admin)
 */
router.post('/',
  customerValidations.create,
  CustomerController.create
);

/**
 * @route PUT /api/customers/:id
 * @desc Atualizar cliente
 * @access Private (Master, Admin)
 */
router.put('/:id',
  customerValidations.validateId,
  customerValidations.update,
  CustomerController.update
);

/**
 * @route PATCH /api/customers/:id/status
 * @desc Alterar status do cliente
 * @access Private (Master, Admin)
 */
router.patch('/:id/status',
  customerValidations.validateId,
  CustomerController.updateStatus
);

/**
 * @route DELETE /api/customers/:id
 * @desc Excluir cliente
 * @access Private (Master, Admin)
 */
router.delete('/:id',
  customerValidations.validateId,
  CustomerController.delete
);

module.exports = router;

