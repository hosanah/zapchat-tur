const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authValidations } = require('../middleware/authValidations');
const { authenticate } = require('../middleware/auth');

// Login
router.post('/login', 
  authValidations.login,
  AuthController.login
);

// Registro
router.post('/register', 
  authValidations.register,
  AuthController.register
);

// Refresh token
router.post('/refresh', 
  authValidations.refresh,
  AuthController.refresh
);

// Logout
router.post('/logout', 
  AuthController.logout
);

// Verificar email
router.post('/verify-email', 
  authValidations.verifyEmail,
  AuthController.verifyEmail
);

// Esqueci minha senha
router.post('/forgot-password', 
  authValidations.forgotPassword,
  AuthController.forgotPassword
);

// Reset de senha
router.post('/reset-password', 
  authValidations.resetPassword,
  AuthController.resetPassword
);

// Obter dados do usuário atual (requer autenticação)
router.get('/me', 
  authenticate,
  AuthController.me
);

module.exports = router;

