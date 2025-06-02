/**
 * Middleware para tratamento de erros globais
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  console.error('❌ Erro:', err);

  // Erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => error.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // Erro de constraint única do Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Recurso já existe';
    error = {
      message,
      statusCode: 409
    };
  }

  // Erro de chave estrangeira do Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Referência inválida';
    error = {
      message,
      statusCode: 400
    };
  }

  // Erro de token JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = {
      message,
      statusCode: 401
    };
  }

  // Erro de token JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = {
      message,
      statusCode: 401
    };
  }

  // Erro de sintaxe JSON
  if (err.type === 'entity.parse.failed') {
    const message = 'JSON inválido';
    error = {
      message,
      statusCode: 400
    };
  }

  // Resposta de erro
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

