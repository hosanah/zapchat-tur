const express = require('express');
const router = express.Router();
const SaleController = require('../controllers/SaleController');
const SalePaymentController = require('../controllers/SalePaymentController');
const { authenticate } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const {
  createSaleValidation,
  updateSaleValidation,
  getSaleValidation,
  deleteSaleValidation,
  listSalesValidation,
  getSalesByCustomerValidation,
  addSaleCustomerValidation,
  listSaleCustomersValidation,
  removeSaleCustomerValidation
} = require('../middleware/saleValidations');
const paymentValidations = require('../middleware/paymentValidations');
const saleAccessoryValidations = require('../middleware/saleAccessoryValidations');
const SaleAccessoryController = require('../controllers/SaleAccessoryController');

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

// GET /api/sales/:id/customers - Listar clientes da venda
router.get('/:id/customers',
  listSaleCustomersValidation,
  checkValidationErrors,
  SaleController.listCustomers
);

// GET /api/sales/:id/voucher - Gerar voucher em PDF
router.get('/:id/voucher', SaleController.voucher);

// Pagamentos da venda
router.get('/:id/payments',
  paymentValidations.list,
  checkValidationErrors,
  SalePaymentController.index
);

router.post('/:id/payments',
  paymentValidations.create,
  checkValidationErrors,
  SalePaymentController.store
);

router.delete('/:id/payments/:payment_id',
  paymentValidations.remove,
  checkValidationErrors,
  SalePaymentController.destroy
);

// Acessórios da venda
router.get('/:id/accessories',
  saleAccessoryValidations.list,
  checkValidationErrors,
  SaleAccessoryController.index
);

router.post('/:id/accessories',
  saleAccessoryValidations.create,
  checkValidationErrors,
  SaleAccessoryController.store
);

router.delete('/:id/accessories/:sale_accessory_id',
  saleAccessoryValidations.remove,
  checkValidationErrors,
  SaleAccessoryController.destroy
);

// POST /api/sales/:id/customers - Adicionar cliente à venda
router.post('/:id/customers',
  addSaleCustomerValidation,
  checkValidationErrors,
  SaleController.addCustomer
);

// DELETE /api/sales/:id/customers/:customer_id - Remover cliente da venda
router.delete('/:id/customers/:customer_id',
  removeSaleCustomerValidation,
  checkValidationErrors,
  SaleController.removeCustomer
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

