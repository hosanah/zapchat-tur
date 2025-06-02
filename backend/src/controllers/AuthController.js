const { User, Company } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const JWTUtils = require('../utils/jwtUtils');
const bcrypt = require('bcryptjs');

/**
 * Controlador para autenticação
 */
class AuthController {
  /**
   * Login do usuário
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Buscar usuário por email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }

      // Verificar se usuário está ativo
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Usuário inativo. Entre em contato com o administrador.'
        });
      }

      // Verificar senha
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }

      // Verificar se empresa está ativa (para usuários não-master)
      if (user.companyId) {
        const company = await Company.findByPk(user.companyId);
        if (!company || !company.isActive) {
          return res.status(401).json({
            success: false,
            error: 'Empresa inativa. Entre em contato com o suporte.'
          });
        }
      }

      // Gerar tokens
      const tokens = JWTUtils.generateTokenPair(user);

      // Atualizar último login
      await user.updateLastLogin();

      // Resposta de sucesso
      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
            Company: user.Company
          },
          tokens
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registro de novo usuário
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const userData = req.body;

      // Verificar se email já existe
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email já está cadastrado'
        });
      }

      // Verificar se empresa existe (para usuários não-master)
      if (userData.role !== 'master' && userData.companyId) {
        const company = await Company.findByPk(userData.companyId);
        if (!company) {
          return res.status(400).json({
            success: false,
            error: 'Empresa não encontrada'
          });
        }

        if (!company.isActive) {
          return res.status(400).json({
            success: false,
            error: 'Empresa inativa'
          });
        }
      }

      // Gerar token de verificação de email
      userData.emailVerificationToken = JWTUtils.generateEmailVerificationToken();

      // Criar usuário
      const user = await User.create(userData);

      // Gerar tokens
      const tokens = JWTUtils.generateTokenPair(user);

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
            emailVerified: user.emailVerified
          },
          tokens
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token
   * POST /api/auth/refresh
   */
  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token é obrigatório'
        });
      }

      // Verificar refresh token
      let decoded;
      try {
        decoded = JWTUtils.verifyRefreshToken(refreshToken);
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token inválido ou expirado'
        });
      }

      // Buscar usuário
      const user = await User.findByPk(decoded.userId, {
        include: ['Company']
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não encontrado ou inativo'
        });
      }

      // Verificar se empresa está ativa (para usuários não-master)
      if (user.companyId && (!user.Company || !user.Company.isActive)) {
        return res.status(401).json({
          success: false,
          error: 'Empresa inativa'
        });
      }

      // Gerar novos tokens
      const tokens = JWTUtils.generateTokenPair(user);

      res.status(200).json({
        success: true,
        message: 'Tokens renovados com sucesso',
        data: {
          tokens
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout
   * POST /api/auth/logout
   */
  static async logout(req, res, next) {
    try {
      // Em uma implementação mais robusta, aqui seria adicionado
      // o token a uma blacklist ou invalidado no banco de dados
      
      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar email
   * POST /api/auth/verify-email
   */
  static async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token de verificação é obrigatório'
        });
      }

      // Buscar usuário pelo token
      const user = await User.findOne({
        where: { emailVerificationToken: token }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Token de verificação inválido'
        });
      }

      // Verificar email
      await user.update({
        emailVerified: true,
        emailVerificationToken: null
      });

      res.status(200).json({
        success: true,
        message: 'Email verificado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Solicitar reset de senha
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email é obrigatório'
        });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        // Por segurança, sempre retornar sucesso mesmo se usuário não existir
        return res.status(200).json({
          success: true,
          message: 'Se o email estiver cadastrado, você receberá instruções para reset da senha'
        });
      }

      // Gerar token de reset
      const resetToken = JWTUtils.generatePasswordResetToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await user.update({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      });

      // Aqui seria enviado o email com o token
      // Por enquanto, apenas retornar sucesso

      res.status(200).json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá instruções para reset da senha'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset de senha
   * POST /api/auth/reset-password
   */
  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Token e nova senha são obrigatórios'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Nova senha deve ter pelo menos 6 caracteres'
        });
      }

      // Buscar usuário pelo token
      const user = await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Token de reset inválido ou expirado'
        });
      }

      // Atualizar senha
      await user.update({
        password: newPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      });

      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar token atual
   * GET /api/auth/me
   */
  static async me(req, res, next) {
    try {
      const user = req.user;

      // Buscar dados atualizados do usuário
      const currentUser = await User.findByPk(user.id, {
        include: ['Company']
      });

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user: currentUser
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;

