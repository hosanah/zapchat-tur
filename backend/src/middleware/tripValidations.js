const { body, param, query } = require('express-validator');

/**
 * Validações para passeios
 */
const tripValidations = {
  // Validação para criação
  create: [
    body('title')
      .notEmpty()
      .withMessage('Título é obrigatório')
      .isLength({ min: 3, max: 100 })
      .withMessage('Título deve ter entre 3 e 100 caracteres')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Descrição deve ter no máximo 2000 caracteres'),
    
    body('origin')
      .notEmpty()
      .withMessage('Origem é obrigatória')
      .isLength({ min: 3, max: 200 })
      .withMessage('Origem deve ter entre 3 e 200 caracteres')
      .trim(),
    
    body('destination')
      .notEmpty()
      .withMessage('Destino é obrigatório')
      .isLength({ min: 3, max: 200 })
      .withMessage('Destino deve ter entre 3 e 200 caracteres')
      .trim(),
    
    body('waypoints')
      .optional()
      .isArray()
      .withMessage('Pontos intermediários devem ser um array'),
    
    body('startDate')
      .notEmpty()
      .withMessage('Data de início é obrigatória')
      .isISO8601()
      .withMessage('Data de início deve ser uma data válida')
      .custom((value) => {
        const startDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (startDate < today) {
          throw new Error('Data de início deve ser hoje ou no futuro');
        }
        
        return true;
      }),
    
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser uma data válida')
      .custom((value, { req }) => {
        if (!value) return true;
        
        const endDate = new Date(value);
        const startDate = new Date(req.body.startDate);
        
        if (endDate <= startDate) {
          throw new Error('Data de fim deve ser posterior à data de início');
        }
        
        return true;
      }),
    
    body('duration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Duração deve ser maior que zero (em minutos)'),
    
    body('distance')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Distância não pode ser negativa'),
    
    body('maxPassengers')
      .notEmpty()
      .withMessage('Número máximo de passageiros é obrigatório')
      .isInt({ min: 1, max: 100 })
      .withMessage('Número máximo de passageiros deve estar entre 1 e 100'),
    
    body('currentPassengers')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Número atual de passageiros não pode ser negativo')
      .custom((value, { req }) => {
        if (value && req.body.maxPassengers && parseInt(value) > parseInt(req.body.maxPassengers)) {
          throw new Error('Número atual de passageiros não pode exceder o máximo');
        }
        return true;
      }),
    
    body('pricePerPerson')
      .notEmpty()
      .withMessage('Preço por pessoa é obrigatório')
      .isFloat({ min: 0 })
      .withMessage('Preço por pessoa não pode ser negativo'),
    
    body('totalPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço total não pode ser negativo'),
    
    body('status')
      .optional()
      .isIn(['planejado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'])
      .withMessage('Status deve ser planejado, confirmado, em_andamento, concluido ou cancelado'),
    
    body('type')
      .notEmpty()
      .withMessage('Tipo é obrigatório')
      .isIn(['turismo', 'transfer', 'excursao', 'fretamento', 'outros'])
      .withMessage('Tipo deve ser turismo, transfer, excursao, fretamento ou outros'),
    
    body('meetingPoint')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Ponto de encontro deve ter entre 3 e 200 caracteres'),
    
    body('meetingTime')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Horário de encontro deve estar no formato HH:MM'),
    
    body('requirements')
      .optional()
      .isObject()
      .withMessage('Requisitos devem ser um objeto JSON'),
    
    body('inclusions')
      .optional()
      .isArray()
      .withMessage('Inclusões devem ser um array'),
    
    body('exclusions')
      .optional()
      .isArray()
      .withMessage('Exclusões devem ser um array'),
    
    body('cancellationPolicy')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Política de cancelamento deve ter no máximo 1000 caracteres'),
    
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    
    body('vehicleId')
      .optional()
      .isUUID()
      .withMessage('ID do veículo deve ser um UUID válido'),
    
    body('driverId')
      .optional()
      .isUUID()
      .withMessage('ID do motorista deve ser um UUID válido'),
    
    body('companyId')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido')
  ],

  // Validação para atualização
  update: [
    body('title')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Título deve ter entre 3 e 100 caracteres')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Descrição deve ter no máximo 2000 caracteres'),
    
    body('origin')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Origem deve ter entre 3 e 200 caracteres')
      .trim(),
    
    body('destination')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Destino deve ter entre 3 e 200 caracteres')
      .trim(),
    
    body('waypoints')
      .optional()
      .isArray()
      .withMessage('Pontos intermediários devem ser um array'),
    
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser uma data válida'),
    
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser uma data válida')
      .custom((value, { req }) => {
        if (!value || !req.body.startDate) return true;
        
        const endDate = new Date(value);
        const startDate = new Date(req.body.startDate);
        
        if (endDate <= startDate) {
          throw new Error('Data de fim deve ser posterior à data de início');
        }
        
        return true;
      }),
    
    body('duration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Duração deve ser maior que zero (em minutos)'),
    
    body('distance')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Distância não pode ser negativa'),
    
    body('maxPassengers')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Número máximo de passageiros deve estar entre 1 e 100'),
    
    body('currentPassengers')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Número atual de passageiros não pode ser negativo'),
    
    body('pricePerPerson')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço por pessoa não pode ser negativo'),
    
    body('totalPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço total não pode ser negativo'),
    
    body('status')
      .optional()
      .isIn(['planejado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'])
      .withMessage('Status deve ser planejado, confirmado, em_andamento, concluido ou cancelado'),
    
    body('type')
      .optional()
      .isIn(['turismo', 'transfer', 'excursao', 'fretamento', 'outros'])
      .withMessage('Tipo deve ser turismo, transfer, excursao, fretamento ou outros'),
    
    body('meetingPoint')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Ponto de encontro deve ter entre 3 e 200 caracteres'),
    
    body('meetingTime')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Horário de encontro deve estar no formato HH:MM'),
    
    body('requirements')
      .optional()
      .isObject()
      .withMessage('Requisitos devem ser um objeto JSON'),
    
    body('inclusions')
      .optional()
      .isArray()
      .withMessage('Inclusões devem ser um array'),
    
    body('exclusions')
      .optional()
      .isArray()
      .withMessage('Exclusões devem ser um array'),
    
    body('cancellationPolicy')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Política de cancelamento deve ter no máximo 1000 caracteres'),
    
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    
    body('vehicleId')
      .optional()
      .isUUID()
      .withMessage('ID do veículo deve ser um UUID válido'),
    
    body('driverId')
      .optional()
      .isUUID()
      .withMessage('ID do motorista deve ser um UUID válido')
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
      .isIn(['planejado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'])
      .withMessage('Status deve ser planejado, confirmado, em_andamento, concluido ou cancelado'),
    
    query('type')
      .optional()
      .isIn(['turismo', 'transfer', 'excursao', 'fretamento', 'outros'])
      .withMessage('Tipo deve ser turismo, transfer, excursao, fretamento ou outros'),
    
    query('companyId')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido'),
    
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser uma data válida'),
    
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser uma data válida'),
    
    query('days')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Dias deve estar entre 1 e 365')
  ]
};

module.exports = { tripValidations };

