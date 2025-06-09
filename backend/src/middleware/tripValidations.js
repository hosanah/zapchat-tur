const { body, param, query } = require('express-validator');

const tripValidations = {
  create: [
    body('title')
      .notEmpty().withMessage('Título é obrigatório')
      .isLength({ min: 3, max: 100 }).withMessage('Título deve ter entre 3 e 100 caracteres'),
    body('description')
      .optional()
      .isLength({ max: 2000 }).withMessage('Descrição deve ter no máximo 2000 caracteres'),
    body('maxPassengers')
      .notEmpty().withMessage('Número máximo de passageiros é obrigatório')
      .isInt({ min: 1 }).withMessage('Número máximo de passageiros deve ser maior que zero'),
    body('priceTrips')
      .notEmpty().withMessage('Preço é obrigatório')
      .isFloat({ min: 0 }).withMessage('Preço não pode ser negativo'),
    body('type')
      .notEmpty().withMessage('Tipo é obrigatório')
      .isIn(['turismo', 'transfer', 'excursao', 'fretamento', 'outros'])
      .withMessage('Tipo inválido'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo','cancelado'])
      .withMessage('Status inválido')
  ],
  update: [
    body('title')
      .optional()
      .isLength({ min: 3, max: 100 }).withMessage('Título deve ter entre 3 e 100 caracteres'),
    body('description')
      .optional()
      .isLength({ max: 2000 }).withMessage('Descrição deve ter no máximo 2000 caracteres'),
    body('maxPassengers')
      .optional()
      .isInt({ min: 1 }).withMessage('Número máximo de passageiros deve ser maior que zero'),
    body('priceTrips')
      .optional()
      .isFloat({ min: 0 }).withMessage('Preço não pode ser negativo'),
    body('type')
      .optional()
      .isIn(['turismo', 'transfer', 'excursao', 'fretamento', 'outros'])
      .withMessage('Tipo inválido'),
    body('status')
      .optional()
      .isIn(['planejado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'])
      .withMessage('Status inválido')
  ],
  updateStatus: [
    body('status')
      .notEmpty().withMessage('Status é obrigatório')
      .isIn(['planejado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'])
      .withMessage('Status inválido')
  ],
  validateId: [
    param('id').isUUID().withMessage('ID deve ser um UUID válido'),
  ],
  validateQuery: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser maior que 0'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite inválido'),
    query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Busca inválida'),
    query('status').optional().isIn(['planejado', 'confirmado', 'em_andamento', 'concluido', 'cancelado']).withMessage('Status inválido'),
  ],
};

module.exports = { tripValidations };
