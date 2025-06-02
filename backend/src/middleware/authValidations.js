const { body } = require('express-validator');

/**
 * Validações para autenticação
 */
const authValidations = {
  // Validação para login
  login: [
    body('email')
      .notEmpty()
      .withMessage('Email é obrigatório')
      .isEmail()
      .withMessage('Email deve ter formato válido')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('Senha é obrigatória')
  ],

  // Validação para registro
  register: [
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
    
    body('confirmPassword')
      .optional()
      .custom((value, { req }) => {
        if (value && value !== req.body.password) {
          throw new Error('Confirmação de senha não confere');
        }
        return true;
      }),
    
    body('phone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
    
    body('role')
      .optional()
      .isIn(['master', 'admin', 'user'])
      .withMessage('Role deve ser master, admin ou user'),
    
    body('companyId')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido')
  ],

  // Validação para refresh token
  refresh: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token é obrigatório')
  ],

  // Validação para verificação de email
  verifyEmail: [
    body('token')
      .notEmpty()
      .withMessage('Token de verificação é obrigatório')
      .isLength({ min: 32, max: 64 })
      .withMessage('Token deve ter entre 32 e 64 caracteres')
  ],

  // Validação para esqueci minha senha
  forgotPassword: [
    body('email')
      .notEmpty()
      .withMessage('Email é obrigatório')
      .isEmail()
      .withMessage('Email deve ter formato válido')
      .normalizeEmail()
  ],

  // Validação para reset de senha
  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Token de reset é obrigatório')
      .isLength({ min: 32, max: 64 })
      .withMessage('Token deve ter entre 32 e 64 caracteres'),
    
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
  ]
};

module.exports = { authValidations };

