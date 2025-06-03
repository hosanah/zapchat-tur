const { body, param, query } = require('express-validator');

const eventValidations = {
  // Validações para criação de evento
  create: [
    body('title')
      .notEmpty()
      .withMessage('Título é obrigatório')
      .isLength({ min: 3, max: 100 })
      .withMessage('Título deve ter entre 3 e 100 caracteres'),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres'),
    
    body('start_date')
      .notEmpty()
      .withMessage('Data de início é obrigatória')
      .isISO8601()
      .withMessage('Data de início deve estar no formato ISO 8601'),
    
    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve estar no formato ISO 8601')
      .custom((value, { req }) => {
        if (value && req.body.start_date) {
          const startDate = new Date(req.body.start_date);
          const endDate = new Date(value);
          if (endDate <= startDate) {
            throw new Error('Data de fim deve ser posterior à data de início');
          }
        }
        return true;
      }),
    
    body('all_day')
      .optional()
      .isBoolean()
      .withMessage('Campo "dia inteiro" deve ser verdadeiro ou falso'),
    
    body('location')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Local deve ter no máximo 200 caracteres'),
    
    body('type')
      .optional()
      .isIn(['passeio', 'manutencao', 'reuniao', 'treinamento', 'outros'])
      .withMessage('Tipo deve ser: passeio, manutencao, reuniao, treinamento ou outros'),
    
    body('status')
      .optional()
      .isIn(['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'])
      .withMessage('Status deve ser: agendado, confirmado, em_andamento, concluido ou cancelado'),
    
    body('priority')
      .optional()
      .isIn(['baixa', 'media', 'alta', 'urgente'])
      .withMessage('Prioridade deve ser: baixa, media, alta ou urgente'),
    
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Cor deve estar no formato hexadecimal (#RRGGBB)'),
    
    body('reminder_minutes')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Lembrete deve ser um número inteiro positivo'),
    
    body('attendees')
      .optional()
      .isArray()
      .withMessage('Participantes deve ser uma lista'),
    
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    
    body('trip_id')
      .optional()
      .isUUID()
      .withMessage('ID do passeio deve ser um UUID válido'),
    
    body('company_id')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido')
  ],

  // Validações para atualização de evento
  update: [
    param('id')
      .isUUID()
      .withMessage('ID do evento deve ser um UUID válido'),
    
    body('title')
      .optional()
      .notEmpty()
      .withMessage('Título não pode estar vazio')
      .isLength({ min: 3, max: 100 })
      .withMessage('Título deve ter entre 3 e 100 caracteres'),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres'),
    
    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve estar no formato ISO 8601'),
    
    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve estar no formato ISO 8601')
      .custom((value, { req }) => {
        if (value && req.body.start_date) {
          const startDate = new Date(req.body.start_date);
          const endDate = new Date(value);
          if (endDate <= startDate) {
            throw new Error('Data de fim deve ser posterior à data de início');
          }
        }
        return true;
      }),
    
    body('all_day')
      .optional()
      .isBoolean()
      .withMessage('Campo "dia inteiro" deve ser verdadeiro ou falso'),
    
    body('location')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Local deve ter no máximo 200 caracteres'),
    
    body('type')
      .optional()
      .isIn(['passeio', 'manutencao', 'reuniao', 'treinamento', 'outros'])
      .withMessage('Tipo deve ser: passeio, manutencao, reuniao, treinamento ou outros'),
    
    body('status')
      .optional()
      .isIn(['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'])
      .withMessage('Status deve ser: agendado, confirmado, em_andamento, concluido ou cancelado'),
    
    body('priority')
      .optional()
      .isIn(['baixa', 'media', 'alta', 'urgente'])
      .withMessage('Prioridade deve ser: baixa, media, alta ou urgente'),
    
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Cor deve estar no formato hexadecimal (#RRGGBB)'),
    
    body('reminder_minutes')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Lembrete deve ser um número inteiro positivo'),
    
    body('attendees')
      .optional()
      .isArray()
      .withMessage('Participantes deve ser uma lista'),
    
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    
    body('trip_id')
      .optional()
      .isUUID()
      .withMessage('ID do passeio deve ser um UUID válido')
  ],

  // Validações para busca por ID
  show: [
    param('id')
      .isUUID()
      .withMessage('ID do evento deve ser um UUID válido')
  ],

  // Validações para exclusão
  destroy: [
    param('id')
      .isUUID()
      .withMessage('ID do evento deve ser um UUID válido')
  ],

  // Validações para busca por período
  getByDateRange: [
    query('start_date')
      .notEmpty()
      .withMessage('Data de início é obrigatória')
      .isISO8601()
      .withMessage('Data de início deve estar no formato ISO 8601'),
    
    query('end_date')
      .notEmpty()
      .withMessage('Data de fim é obrigatória')
      .isISO8601()
      .withMessage('Data de fim deve estar no formato ISO 8601')
      .custom((value, { req }) => {
        if (value && req.query.start_date) {
          const startDate = new Date(req.query.start_date);
          const endDate = new Date(value);
          if (endDate <= startDate) {
            throw new Error('Data de fim deve ser posterior à data de início');
          }
        }
        return true;
      }),
    
    query('company_id')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido')
  ],

  // Validações para listagem
  index: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro positivo'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100'),
    
    query('start_date')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve estar no formato ISO 8601'),
    
    query('end_date')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve estar no formato ISO 8601'),
    
    query('type')
      .optional()
      .isIn(['passeio', 'manutencao', 'reuniao', 'treinamento', 'outros'])
      .withMessage('Tipo deve ser: passeio, manutencao, reuniao, treinamento ou outros'),
    
    query('status')
      .optional()
      .isIn(['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'])
      .withMessage('Status deve ser: agendado, confirmado, em_andamento, concluido ou cancelado'),
    
    query('search')
      .optional()
      .isLength({ min: 2 })
      .withMessage('Busca deve ter pelo menos 2 caracteres'),
    
    query('company_id')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido')
  ],

  // Validações para eventos próximos
  getUpcomingEvents: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limite deve ser um número entre 1 e 50'),
    
    query('company_id')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido')
  ],

  // Validações para eventos de hoje
  getTodayEvents: [
    query('company_id')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido')
  ]
};

module.exports = eventValidations;

