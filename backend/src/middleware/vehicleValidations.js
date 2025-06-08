const { body, param, query } = require('express-validator');

/**
 * Validações para veículos
 */
const vehicleValidations = {
  // Validação para criação
  create: [
    body('plate')
      .notEmpty()
      .withMessage('Placa é obrigatória')
      .isLength({ min: 7, max: 10 })
      .withMessage('Placa deve ter entre 7 e 10 caracteres')
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Placa deve conter apenas letras e números'),
    
    body('brand')
      .notEmpty()
      .withMessage('Marca é obrigatória')
      .isLength({ min: 2, max: 50 })
      .withMessage('Marca deve ter entre 2 e 50 caracteres')
      .trim(),
    
    body('model')
      .notEmpty()
      .withMessage('Modelo é obrigatório')
      .isLength({ min: 2, max: 50 })
      .withMessage('Modelo deve ter entre 2 e 50 caracteres')
      .trim(),
    
    body('year')
      .notEmpty()
      .withMessage('Ano é obrigatório')
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage(`Ano deve estar entre 1900 e ${new Date().getFullYear() + 1}`),
    
    body('color')
      .notEmpty()
      .withMessage('Cor é obrigatória')
      .isLength({ min: 2, max: 30 })
      .withMessage('Cor deve ter entre 2 e 30 caracteres')
      .trim(),
    
    body('capacity')
      .notEmpty()
      .withMessage('Capacidade é obrigatória')
      .isInt({ min: 1, max: 100 })
      .withMessage('Capacidade deve estar entre 1 e 100'),
    
    body('type')
      .notEmpty()
      .withMessage('Tipo é obrigatório')
      .isIn(['van', 'micro-onibus', 'onibus', 'carro', 'suv'])
      .withMessage('Tipo deve ser van, micro-onibus, onibus, carro ou suv'),
    
    body('fuel')
      .notEmpty()
      .withMessage('Combustível é obrigatório')
      .isIn(['gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido'])
      .withMessage('Combustível deve ser gasolina, etanol, diesel, flex, eletrico ou hibrido'),
    
    body('renavam')
      .optional()
      .isLength({ min: 11, max: 11 })
      .withMessage('RENAVAM deve ter 11 dígitos')
      .isNumeric()
      .withMessage('RENAVAM deve conter apenas números'),
    
    body('chassi')
      .optional()
      .isLength({ min: 17, max: 17 })
      .withMessage('Chassi deve ter 17 caracteres')
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Chassi deve conter apenas letras e números'),
    
    body('mileage')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Quilometragem não pode ser negativa'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'manutencao', 'inativo'])
      .withMessage('Status deve ser ativo, manutencao ou inativo'),
    
    body('observations')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    
    body('company_id')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido')
  ],

  // Validação para atualização
  update: [
    body('plate')
      .optional()
      .isLength({ min: 7, max: 10 })
      .withMessage('Placa deve ter entre 7 e 10 caracteres')
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Placa deve conter apenas letras e números'),
    
    body('brand')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Marca deve ter entre 2 e 50 caracteres')
      .trim(),
    
    body('model')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Modelo deve ter entre 2 e 50 caracteres')
      .trim(),
    
    body('year')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage(`Ano deve estar entre 1900 e ${new Date().getFullYear() + 1}`),
    
    body('color')
      .optional()
      .isLength({ min: 2, max: 30 })
      .withMessage('Cor deve ter entre 2 e 30 caracteres')
      .trim(),
    
    body('capacity')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Capacidade deve estar entre 1 e 100'),
    
    body('type')
      .optional()
      .isIn(['van', 'micro-onibus', 'onibus', 'carro', 'suv'])
      .withMessage('Tipo deve ser van, micro-onibus, onibus, carro ou suv'),
    
    body('fuel')
      .optional()
      .isIn(['gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido'])
      .withMessage('Combustível deve ser gasolina, etanol, diesel, flex, eletrico ou hibrido'),
    
    body('renavam')
      .optional()
      .isLength({ min: 11, max: 11 })
      .withMessage('RENAVAM deve ter 11 dígitos')
      .isNumeric()
      .withMessage('RENAVAM deve conter apenas números'),
    
    body('chassi')
      .optional()
      .isLength({ min: 17, max: 17 })
      .withMessage('Chassi deve ter 17 caracteres')
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Chassi deve conter apenas letras e números'),
    
    body('mileage')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Quilometragem não pode ser negativa'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'manutencao', 'inativo'])
      .withMessage('Status deve ser ativo, manutencao ou inativo'),
    
    body('observations')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres')
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
      .isIn(['ativo', 'manutencao', 'inativo'])
      .withMessage('Status deve ser ativo, manutencao ou inativo'),
    
    query('type')
      .optional()
      .isIn(['van', 'micro-onibus', 'onibus', 'carro', 'suv'])
      .withMessage('Tipo deve ser van, micro-onibus, onibus, carro ou suv'),
    
    query('company_id')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido')
  ]
};

module.exports = { vehicleValidations };

