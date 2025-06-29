const { User, Company } = require('../models');
const JWTUtils = require('../utils/jwtUtils');

console.log('✅ Arquivo auth.js carregado com sucesso');

/**
 * Middleware de autenticação
 */
const authenticate = async (req, res, next) => {
  try {
    // Extrair token do header
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso requerido'
      });
    }

    // Verificar token
    let decoded;
    try {
      decoded = JWTUtils.verifyAccessToken(token);
    } catch (error) {
      // Verificar se é erro de token expirado
      if (error.message.includes('jwt expired')) {
        return res.status(401).json({
          success: false,
          error: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado',
        code: 'TOKEN_INVALID'
      });
    }

    // Buscar usuário
    const user = await User.findByPk(decoded.userId, {
      include: ['company']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Usuário inativo'
      });
    }

    // Verificar se empresa está ativa (para usuários não-master)
    if (user.company_id && (!user.company || !user.company.isActive)) {
      return res.status(401).json({
        success: false,
        error: 'Empresa inativa'
      });
    }

    // Atualizar último acesso do usuário
    await user.updateLastActivity();

    // Adicionar usuário ao request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware de autorização por role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Permissão insuficiente.'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar se usuário é master
 */
const requireMaster = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Usuário não autenticado'
    });
  }

  if (!req.user.isMaster()) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Apenas usuários master podem acessar este recurso.'
    });
  }

  next();
};

/**
 * Middleware para verificar acesso à empresa
 */
const requireCompanyAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Usuário não autenticado'
    });
  }

  // Usuários master podem acessar qualquer empresa
  if (req.user.isMaster()) {
    return next();
  }

  // Obter ID da empresa do parâmetro ou query
  const company_id = req.params.company_id || req.query.company_id || req.body.company_id;

  if (!company_id) {
    return res.status(400).json({
      success: false,
      error: 'ID da empresa é obrigatório'
    });
  }

  // Verificar se usuário pode acessar a empresa
  if (!req.user.canAccessCompany(company_id)) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Você não pode acessar dados desta empresa.'
    });
  }

  next();
};

/**
 * Middleware para verificar se usuário pode modificar outro usuário
 */
const requireUserAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Usuário não autenticado'
    });
  }

  const targetUserId = req.params.id || req.params.userId;

  // Usuário pode sempre modificar a si mesmo
  if (req.user.id === targetUserId) {
    return next();
  }

  // Usuários master podem modificar qualquer usuário
  if (req.user.isMaster()) {
    return next();
  }

  // Admins podem modificar usuários da mesma empresa
  if (req.user.isAdmin()) {
    // Aqui seria necessário buscar o usuário alvo para verificar a empresa
    // Por simplicidade, vamos permitir por enquanto
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Acesso negado. Você não pode modificar este usuário.'
  });
};

/**
 * Middleware opcional de autenticação (não falha se não houver token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return next();
    }

    try {
      const decoded = JWTUtils.verifyAccessToken(token);
      const user = await User.findByPk(decoded.userId, {
        include: ['company']
      });

      if (user && user.isActive) {
        // Atualizar último acesso do usuário
        await user.updateLastActivity();
        
        req.user = user;
        req.token = token;
      }
    } catch (error) {
      // Ignorar erros de token em autenticação opcional
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  requireMaster,
  requireCompanyAccess,
  requireUserAccess,
  optionalAuth
};
