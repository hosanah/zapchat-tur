const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/BookingController');
const { authenticate, authorize } = require('../middleware/auth');
const { bookingValidations } = require('../middleware/bookingValidations');

// Aplicar autenticação a todas as rotas
router.use(authenticate);

/**
 * @route GET /api/bookings
 * @desc Listar todas as reservas
 * @access Private (Master, Admin, User)
 */
router.get('/', 
  bookingValidations.validateQuery,
  BookingController.getAll
);

/**
 * @route GET /api/bookings/pending
 * @desc Obter reservas pendentes
 * @access Private (Master, Admin, User)
 */
router.get('/pending',
  bookingValidations.validateQuery,
  BookingController.getPending
);

/**
 * @route GET /api/bookings/revenue
 * @desc Obter estatísticas de receita
 * @access Private (Master, Admin, User)
 */
router.get('/revenue',
  bookingValidations.validateQuery,
  BookingController.getRevenue
);

/**
 * @route GET /api/bookings/:id
 * @desc Obter reserva por ID
 * @access Private (Master, Admin, User)
 */
router.get('/:id',
  bookingValidations.validateId,
  BookingController.getById
);

/**
 * @route POST /api/bookings
 * @desc Criar nova reserva
 * @access Private (Master, Admin)
 */
router.post('/',
  authorize(['master', 'admin']),
  bookingValidations.create,
  BookingController.create
);

/**
 * @route PUT /api/bookings/:id
 * @desc Atualizar reserva
 * @access Private (Master, Admin)
 */
router.put('/:id',
  authorize(['master', 'admin']),
  bookingValidations.validateId,
  bookingValidations.update,
  BookingController.update
);

/**
 * @route PATCH /api/bookings/:id/payment
 * @desc Confirmar pagamento
 * @access Private (Master, Admin)
 */
router.patch('/:id/payment',
  authorize(['master', 'admin']),
  bookingValidations.validateId,
  bookingValidations.confirmPayment,
  BookingController.confirmPayment
);

/**
 * @route DELETE /api/bookings/:id
 * @desc Cancelar reserva
 * @access Private (Master, Admin)
 */
router.delete('/:id',
  authorize(['master', 'admin']),
  bookingValidations.validateId,
  BookingController.delete
);

module.exports = router;

