const express = require('express');
const router = express.Router();
const SaleController = require('../controllers/SaleController');
const { authenticate } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const {
  createSaleValidation,
  updateSaleValidation,
  getSaleValidation,
  deleteSaleValidation,
  listSalesValidation,
  getSalesByCustomerValidation
} = require('../middleware/saleValidations');

// Middleware para verificar erros de validação
const checkValidationErrors = (req, res, next) => {
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

// Rotas protegidas por autenticação
router.use(authenticate);

// GET /api/sales - Listar vendas com filtros e paginação
router.get('/', 
  listSalesValidation,
  checkValidationErrors,
  SaleController.index
);

// GET /api/sales/stats - Obter estatísticas de vendas
router.get('/stats', SaleController.stats);

// GET /api/sales/customer/:customer_id - Buscar vendas por cliente
router.get('/customer/:customer_id',
  getSalesByCustomerValidation,
  checkValidationErrors,
  SaleController.byCustomer
);


// GET /api/sales/:id - Buscar venda específica
router.get('/:id',
  getSaleValidation,
  checkValidationErrors,
  SaleController.show
);

// POST /api/sales - Criar nova venda
router.post('/',
  createSaleValidation,
  checkValidationErrors,
  SaleController.store
);

// PUT /api/sales/:id - Atualizar venda
router.put('/:id',
  updateSaleValidation,
  checkValidationErrors,
  SaleController.update
);

// DELETE /api/sales/:id - Excluir venda (soft delete)
router.delete('/:id',
  deleteSaleValidation,
  checkValidationErrors,
  SaleController.destroy
);

module.exports = router;

