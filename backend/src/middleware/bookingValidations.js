const { body, param, query } = require('express-validator');

/**
 * Validações para reservas
 */
const bookingValidations = {
  // Validação para criação
  create: [
    body('passengers')
      .notEmpty()
      .withMessage('Número de passageiros é obrigatório')
      .isInt({ min: 1, max: 50 })
      .withMessage('Número de passageiros deve estar entre 1 e 50'),
    
    body('totalAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor total não pode ser negativo'),
    
    body('status')
      .optional()
      .isIn(['pendente', 'confirmado', 'pago', 'cancelado'])
      .withMessage('Status deve ser pendente, confirmado, pago ou cancelado'),
    
    body('paymentMethod')
      .optional()
      .isIn(['dinheiro', 'cartao', 'pix', 'transferencia', 'outros'])
      .withMessage('Método de pagamento deve ser dinheiro, cartao, pix, transferencia ou outros'),
    
    body('paymentDate')
      .optional()
      .isISO8601()
      .withMessage('Data de pagamento deve ser uma data válida'),
    
    body('bookingDate')
      .optional()
      .isISO8601()
      .withMessage('Data da reserva deve ser uma data válida'),
    
    body('specialRequests')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Solicitações especiais devem ter no máximo 1000 caracteres'),
    
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    
    body('customerId')
      .notEmpty()
      .withMessage('ID do cliente é obrigatório')
      .isUUID()
      .withMessage('ID do cliente deve ser um UUID válido'),
    
    body('tripId')
      .notEmpty()
      .withMessage('ID do passeio é obrigatório')
      .isUUID()
      .withMessage('ID do passeio deve ser um UUID válido')
  ],

  // Validação para atualização
  update: [
    body('passengers')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Número de passageiros deve estar entre 1 e 50'),
    
    body('totalAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor total não pode ser negativo'),
    
    body('status')
      .optional()
      .isIn(['pendente', 'confirmado', 'pago', 'cancelado'])
      .withMessage('Status deve ser pendente, confirmado, pago ou cancelado'),
    
    body('paymentMethod')
      .optional()
      .isIn(['dinheiro', 'cartao', 'pix', 'transferencia', 'outros'])
      .withMessage('Método de pagamento deve ser dinheiro, cartao, pix, transferencia ou outros'),
    
    body('paymentDate')
      .optional()
      .isISO8601()
      .withMessage('Data de pagamento deve ser uma data válida'),
    
    body('bookingDate')
      .optional()
      .isISO8601()
      .withMessage('Data da reserva deve ser uma data válida'),
    
    body('specialRequests')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Solicitações especiais devem ter no máximo 1000 caracteres'),
    
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres')
  ],

  // Validação para confirmação de pagamento
  confirmPayment: [
    body('paymentMethod')
      .notEmpty()
      .withMessage('Método de pagamento é obrigatório')
      .isIn(['dinheiro', 'cartao', 'pix', 'transferencia', 'outros'])
      .withMessage('Método de pagamento deve ser dinheiro, cartao, pix, transferencia ou outros')
  ],

  // Validação de ID
  validateId: [
    param('id')
      .isUUID()
      .withMessage('ID deve ser um UUID válido')
  ],

  // Validação de query parameters
  validateQuery: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número maior que 0'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve estar entre 1 e 100'),
    
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Busca deve ter entre 1 e 100 caracteres'),
    
    query('status')
      .optional()
      .isIn(['pendente', 'confirmado', 'pago', 'cancelado'])
      .withMessage('Status deve ser pendente, confirmado, pago ou cancelado'),
    
    query('companyId')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido'),
    
    query('tripId')
      .optional()
      .isUUID()
      .withMessage('ID do passeio deve ser um UUID válido'),
    
    query('customerId')
      .optional()
      .isUUID()
      .withMessage('ID do cliente deve ser um UUID válido'),
    
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser uma data válida'),
    
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser uma data válida')
  ]
};

module.exports = { bookingValidations };

