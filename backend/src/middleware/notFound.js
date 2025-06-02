/**
 * Middleware para tratar rotas não encontradas
 */
const notFound = (req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = notFound;

