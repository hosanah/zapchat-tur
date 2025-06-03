const express = require('express');
const router = express.Router();
const EventController = require('../controllers/EventController');
const eventValidations = require('../middleware/eventValidations');
const auth = require('../middleware/auth');
const { validationResult } = require('express-validator');

// Middleware para verificar erros de validação
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas específicas (devem vir antes das rotas genéricas)
router.get('/date-range', 
  eventValidations.getByDateRange, 
  checkValidation, 
  EventController.getByDateRange
);

router.get('/today', 
  eventValidations.getTodayEvents, 
  checkValidation, 
  EventController.getTodayEvents
);

router.get('/upcoming', 
  eventValidations.getUpcomingEvents, 
  checkValidation, 
  EventController.getUpcomingEvents
);

// Rotas CRUD padrão
router.get('/', 
  eventValidations.index, 
  checkValidation, 
  EventController.index
);

router.get('/:id', 
  eventValidations.show, 
  checkValidation, 
  EventController.show
);

router.post('/', 
  eventValidations.create, 
  checkValidation, 
  EventController.store
);

router.put('/:id', 
  eventValidations.update, 
  checkValidation, 
  EventController.update
);

router.delete('/:id', 
  eventValidations.destroy, 
  checkValidation, 
  EventController.destroy
);

module.exports = router;

