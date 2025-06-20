const { body, param, query } = require('express-validator');
const { User } = require('../models');

// Validações para criação de venda
const createSaleValidation = [
  body().custom((_, { req }) => {
    if (!req.body.customer_id && !req.body.new_customer) {
      throw new Error('ID do cliente é obrigatório');
    }
    return true;
  }),
  body('customer_id')
    .optional()
    .isUUID()
    .withMessage('ID do cliente deve ser um UUID válido'),
  body('new_customer')
    .optional()
    .isObject()
    .withMessage('Dados do novo cliente inválidos'),
  body('new_customer.firstName')
    .if(body('new_customer').exists())
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('new_customer.lastName')
    .if(body('new_customer').exists())
    .notEmpty()
    .withMessage('Sobrenome é obrigatório')
    .isLength({ min: 2, max: 50 })
    .withMessage('Sobrenome deve ter entre 2 e 50 caracteres'),
  body('new_customer.email')
    .if(body('new_customer').exists())
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ser válido'),
  body('new_customer.phone')
    .if(body('new_customer').exists())
    .notEmpty()
    .withMessage('Telefone é obrigatório')
    .isLength({ min: 10, max: 20 })
    .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
  body('new_customer.birthDate')
    .if(body('new_customer').exists())
    .optional()
    .isISO8601()
    .withMessage('Data de nascimento inválida'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),

  body('subtotal')
    .notEmpty()
    .withMessage('Subtotal é obrigatório')
    .isFloat({ min: 0 })
    .withMessage('Subtotal deve ser um valor positivo'),

  body('discount_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor do desconto deve ser positivo'),

  body('discount_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Percentual de desconto deve estar entre 0 e 100'),

  body('tax_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor de impostos deve ser positivo'),

  body('status')
    .optional()
    .isIn(['orcamento', 'pendente', 'confirmada', 'paga', 'cancelada', 'reembolsada'])
    .withMessage('Status deve ser: orcamento, pendente, confirmada, paga, cancelada ou reembolsada'),

  body('priority')
    .optional()
    .isIn(['baixa', 'media', 'alta', 'urgente'])
    .withMessage('Prioridade deve ser: baixa, media, alta ou urgente'),


  body('payment_status')
    .optional()
    .isIn(['pendente', 'parcial', 'pago', 'atrasado', 'cancelado'])
    .withMessage('Status de pagamento deve ser: pendente, parcial, pago, atrasado ou cancelado'),

  body('payment_date')
    .optional()
    .isISO8601()
    .withMessage('Data de pagamento deve ser uma data válida'),

  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Data de vencimento deve ser uma data válida'),

  body('installments')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Número de parcelas deve estar entre 1 e 24'),

  body('sale_date')
    .optional()
    .isISO8601()
    .withMessage('Data da venda deve ser uma data válida'),

  body('delivery_date')
    .optional()
    .isISO8601()
    .withMessage('Data de entrega deve ser uma data e hora válidas')
    .matches(/T\d{2}:\d{2}/)
    .withMessage('Data de entrega deve incluir hora'),

  body('commission_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Percentual de comissão deve estar entre 0 e 100'),

  body('notes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Observações devem ter no máximo 2000 caracteres'),

  body('internal_notes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Notas internas devem ter no máximo 2000 caracteres'),

  body('seller_id')
    .notEmpty()
    .withMessage('ID do vendedor é obrigatório')
    .isUUID()
    .withMessage('ID do vendedor deve ser um UUID válido')
    .custom(async (value, { req }) => {
      const seller = await User.findByPk(value);
      if (!seller) {
        throw new Error('Vendedor não encontrado');
      }
      if (!['admin', 'user'].includes(seller.role)) {
        throw new Error('Usuário informado não é um vendedor');
      }
      if (req.user.role !== 'master' && seller.company_id !== req.user.company_id) {
        throw new Error('Vendedor deve pertencer à mesma empresa que o usuário autenticado');
      }
      return true;
    }),


  body('trip_id')
    .notEmpty()
    .withMessage('ID do passeio é obrigatório')
    .isUUID()
    .withMessage('ID do passeio deve ser um UUID válido'),

  // Validação customizada para verificar se due_date é posterior a sale_date
  body('due_date').custom((value, { req }) => {
    if (value && req.body.sale_date) {
      const saleDate = new Date(req.body.sale_date);
      const dueDate = new Date(value);
      
      if (dueDate < saleDate) {
        throw new Error('Data de vencimento deve ser posterior à data da venda');
      }
    }
    return true;
  }),

  // Validação customizada para verificar se delivery_date é posterior a sale_date
  body('delivery_date').custom((value, { req }) => {
    if (value && req.body.sale_date) {
      const saleDate = new Date(req.body.sale_date);
      const deliveryDate = new Date(value);
      
      if (deliveryDate < saleDate) {
        throw new Error('Data de entrega deve ser posterior à data da venda');
      }
    }
    return true;
  }),

  // Validação customizada para verificar consistência entre desconto em valor e percentual
  body('discount_amount').custom((value, { req }) => {
    const discountAmount = parseFloat(value) || 0;
    const discountPercentage = parseFloat(req.body.discount_percentage) || 0;
    const subtotal = parseFloat(req.body.subtotal) || 0;

    if (discountAmount > 0 && discountPercentage > 0) {
      const calculatedDiscount = (subtotal * discountPercentage) / 100;
      const tolerance = 0.01; // Tolerância de 1 centavo
      
      if (Math.abs(discountAmount - calculatedDiscount) > tolerance) {
        throw new Error('Valor do desconto não confere com o percentual informado');
      }
    }

    if (discountAmount > subtotal) {
      throw new Error('Valor do desconto não pode ser maior que o subtotal');
    }

    return true;
  })
];

// Validações para atualização de venda
const updateSaleValidation = [
  param('id')
    .isUUID()
    .withMessage('ID da venda deve ser um UUID válido'),

  body('customer_id')
    .optional()
    .isUUID()
    .withMessage('ID do cliente deve ser um UUID válido'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),

  body('subtotal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Subtotal deve ser um valor positivo'),

  body('discount_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor do desconto deve ser positivo'),

  body('discount_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Percentual de desconto deve estar entre 0 e 100'),

  body('tax_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor de impostos deve ser positivo'),

  body('status')
    .optional()
    .isIn(['orcamento', 'pendente', 'confirmada', 'paga', 'cancelada', 'reembolsada'])
    .withMessage('Status deve ser: orcamento, pendente, confirmada, paga, cancelada ou reembolsada'),

  body('priority')
    .optional()
    .isIn(['baixa', 'media', 'alta', 'urgente'])
    .withMessage('Prioridade deve ser: baixa, media, alta ou urgente'),


  body('payment_status')
    .optional()
    .isIn(['pendente', 'parcial', 'pago', 'atrasado', 'cancelado'])
    .withMessage('Status de pagamento deve ser: pendente, parcial, pago, atrasado ou cancelado'),

  body('payment_date')
    .optional()
    .isISO8601()
    .withMessage('Data de pagamento deve ser uma data válida'),

  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Data de vencimento deve ser uma data válida'),

  body('installments')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Número de parcelas deve estar entre 1 e 24'),

  body('sale_date')
    .optional()
    .isISO8601()
    .withMessage('Data da venda deve ser uma data válida'),

  body('delivery_date')
    .optional()
    .isISO8601()
    .withMessage('Data de entrega deve ser uma data e hora válidas')
    .matches(/T\d{2}:\d{2}/)
    .withMessage('Data de entrega deve incluir hora'),

  body('commission_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Percentual de comissão deve estar entre 0 e 100'),

  body('notes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Observações devem ter no máximo 2000 caracteres'),

  body('internal_notes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Notas internas devem ter no máximo 2000 caracteres'),

  body('seller_id')
    .notEmpty()
    .withMessage('ID do vendedor é obrigatório')
    .isUUID()
    .withMessage('ID do vendedor deve ser um UUID válido')
    .custom(async (value, { req }) => {
      const seller = await User.findByPk(value);
      if (!seller) {
        throw new Error('Vendedor não encontrado');
      }
      if (!['admin', 'user'].includes(seller.role)) {
        throw new Error('Usuário informado não é um vendedor');
      }
      if (req.user.role !== 'master' && seller.company_id !== req.user.company_id) {
        throw new Error('Vendedor deve pertencer à mesma empresa que o usuário autenticado');
      }
      return true;
    }),

  body('trip_id')
    .optional()
    .isUUID()
    .withMessage('ID do passeio deve ser um UUID válido')
];

// Validações para busca de venda por ID
const getSaleValidation = [
  param('id')
    .isUUID()
    .withMessage('ID da venda deve ser um UUID válido')
];

// Validações para exclusão de venda
const deleteSaleValidation = [
  param('id')
    .isUUID()
    .withMessage('ID da venda deve ser um UUID válido')
];

// Validações para listagem com filtros
const listSalesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),

  query('status')
    .optional()
    .isIn(['orcamento', 'pendente', 'confirmada', 'paga', 'cancelada', 'reembolsada'])
    .withMessage('Status deve ser: orcamento, pendente, confirmada, paga, cancelada ou reembolsada'),

  query('payment_status')
    .optional()
    .isIn(['pendente', 'parcial', 'pago', 'atrasado', 'cancelado'])
    .withMessage('Status de pagamento deve ser: pendente, parcial, pago, atrasado ou cancelado'),

  query('customer_id')
    .optional()
    .isUUID()
    .withMessage('ID do cliente deve ser um UUID válido'),


  query('trip_id')
    .optional()
    .isUUID()
    .withMessage('ID do passeio deve ser um UUID válido'),

  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Data inicial deve ser uma data válida'),

  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('Data final deve ser uma data válida'),

  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),

  query('sort_by')
    .optional()
    .isIn(['sale_date', 'total_amount', 'status', 'payment_status', 'created_at', 'updated_at'])
    .withMessage('Campo de ordenação inválido'),

  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Ordem deve ser ASC ou DESC'),

  // Validação customizada para verificar se end_date é posterior a start_date
  query('end_date').custom((value, { req }) => {
    if (value && req.query.start_date) {
      const startDate = new Date(req.query.start_date);
      const endDate = new Date(value);
      
      if (endDate < startDate) {
        throw new Error('Data final deve ser posterior à data inicial');
      }
    }
    return true;
  })
];

// Validações para busca por cliente
const getSalesByCustomerValidation = [
  param('customer_id')
    .isUUID()
    .withMessage('ID do cliente deve ser um UUID válido')
];

// Validação para adicionar cliente em venda
const addSaleCustomerValidation = [
  param('id')
    .isUUID()
    .withMessage('ID da venda deve ser um UUID válido'),
  body('firstName')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('lastName')
    .notEmpty()
    .withMessage('Sobrenome é obrigatório')
    .isLength({ min: 2, max: 50 })
    .withMessage('Sobrenome deve ter entre 2 e 50 caracteres'),
  body('email')
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ser válido'),
  body('phone')
    .notEmpty()
    .withMessage('Telefone é obrigatório')
    .isLength({ min: 10, max: 20 })
    .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Data de nascimento inválida'),
];

// Validação para listagem de clientes da venda
const listSaleCustomersValidation = [
  param('id')
    .isUUID()
    .withMessage('ID da venda deve ser um UUID válido'),
];

// Validação para remover cliente da venda
const removeSaleCustomerValidation = [
  param('id')
    .isUUID()
    .withMessage('ID da venda deve ser um UUID válido'),
  param('customer_id')
    .isUUID()
    .withMessage('ID do cliente deve ser um UUID válido'),
];


module.exports = {
  createSaleValidation,
  updateSaleValidation,
  getSaleValidation,
  deleteSaleValidation,
  listSalesValidation,
  getSalesByCustomerValidation,
  addSaleCustomerValidation,
  listSaleCustomersValidation,
  removeSaleCustomerValidation,

};

