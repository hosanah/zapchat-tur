const { body, param, query } = require('express-validator');

/**
 * Validações para operações com usuários
 */
const userValidations = {
  // Validação para criação de usuário
  create: [
    body('firstName')
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 2, max: 50 })
      .withMessage('Nome deve ter entre 2 e 50 caracteres')
      .trim(),
    
    body('lastName')
      .notEmpty()
      .withMessage('Sobrenome é obrigatório')
      .isLength({ min: 2, max: 50 })
      .withMessage('Sobrenome deve ter entre 2 e 50 caracteres')
      .trim(),
    
    body('email')
      .notEmpty()
      .withMessage('Email é obrigatório')
      .isEmail()
      .withMessage('Email deve ter formato válido')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('Senha é obrigatória')
      .isLength({ min: 6, max: 100 })
      .withMessage('Senha deve ter entre 6 e 100 caracteres'),
    
    body('phone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
    
    body('role')
      .optional()
      .isIn(['master', 'admin', 'user'])
      .withMessage('Role deve ser master, admin ou user'),
    
    body('company_id')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido'),
    
    body('preferences')
      .optional()
      .isObject()
      .withMessage('Preferences deve ser um objeto válido')
  ],

  // Validação para atualização de usuário
  update: [
    body('firstName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Nome deve ter entre 2 e 50 caracteres')
      .trim(),
    
    body('lastName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Sobrenome deve ter entre 2 e 50 caracteres')
      .trim(),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email deve ter formato válido')
      .normalizeEmail(),
    
    body('password')
      .optional()
      .isLength({ min: 6, max: 100 })
      .withMessage('Senha deve ter entre 6 e 100 caracteres'),
    
    body('phone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
    
    body('role')
      .optional()
      .isIn(['master', 'admin', 'user'])
      .withMessage('Role deve ser master, admin ou user'),
    
    body('company_id')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido'),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive deve ser um valor booleano'),
    
    body('emailVerified')
      .optional()
      .isBoolean()
      .withMessage('emailVerified deve ser um valor booleano'),
    
    body('preferences')
      .optional()
      .isObject()
      .withMessage('Preferences deve ser um objeto válido')
  ],

  // Validação para atualização de perfil
  updateProfile: [
    body('firstName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Nome deve ter entre 2 e 50 caracteres')
      .trim(),
    
    body('lastName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Sobrenome deve ter entre 2 e 50 caracteres')
      .trim(),
    
    body('phone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
    
    body('preferences')
      .optional()
      .isObject()
      .withMessage('Preferences deve ser um objeto válido')
  ],

  // Validação para alteração de senha
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Senha atual é obrigatória'),
    
    body('newPassword')
      .notEmpty()
      .withMessage('Nova senha é obrigatória')
      .isLength({ min: 6, max: 100 })
      .withMessage('Nova senha deve ter entre 6 e 100 caracteres'),
    
    body('confirmPassword')
      .optional()
      .custom((value, { req }) => {
        if (value && value !== req.body.newPassword) {
          throw new Error('Confirmação de senha não confere');
        }
        return true;
      })
  ],

  // Validação para parâmetros de ID
  validateId: [
    param('id')
      .isUUID()
      .withMessage('ID deve ser um UUID válido')
  ],

  // Validação para query parameters
  validateQuery: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro maior que 0'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100'),
    
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Busca deve ter entre 1 e 100 caracteres')
      .trim(),
    
    query('role')
      .optional()
      .isIn(['master', 'admin', 'user'])
      .withMessage('Role deve ser master, admin ou user'),
    
    query('active')
      .optional()
      .isBoolean()
      .withMessage('Active deve ser um valor booleano'),
    
    query('company_id')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido')
  ]
};

module.exports = { userValidations };

