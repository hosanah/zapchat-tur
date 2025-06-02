const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Utilitários para JWT
 */
class JWTUtils {
  /**
   * Gerar token de acesso
   */
  static generateAccessToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'zapchat-tur',
        audience: 'zapchat-tur-users'
      }
    );
  }

  /**
   * Gerar refresh token
   */
  static generateRefreshToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'zapchat-tur',
        audience: 'zapchat-tur-refresh'
      }
    );
  }

  /**
   * Verificar token de acesso
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'zapchat-tur',
        audience: 'zapchat-tur-users'
      });
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  /**
   * Verificar refresh token
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        issuer: 'zapchat-tur',
        audience: 'zapchat-tur-refresh'
      });
    } catch (error) {
      throw new Error('Refresh token inválido ou expirado');
    }
  }

  /**
   * Decodificar token sem verificar (para debug)
   */
  static decodeToken(token) {
    return jwt.decode(token, { complete: true });
  }

  /**
   * Extrair token do header Authorization
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Gerar par de tokens (access + refresh)
   */
  static generateTokenPair(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      firstName: user.firstName,
      lastName: user.lastName
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken({ userId: user.id });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
  }

  /**
   * Gerar token de verificação de email
   */
  static generateEmailVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Gerar token de reset de senha
   */
  static generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verificar se token está próximo do vencimento
   */
  static isTokenExpiringSoon(token, minutesThreshold = 5) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      const thresholdSeconds = minutesThreshold * 60;

      return timeUntilExpiry <= thresholdSeconds;
    } catch (error) {
      return true;
    }
  }

  /**
   * Obter informações do token
   */
  static getTokenInfo(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded) {
        return null;
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        companyId: decoded.companyId,
        issuedAt: new Date(decoded.iat * 1000),
        expiresAt: new Date(decoded.exp * 1000),
        issuer: decoded.iss,
        audience: decoded.aud
      };
    } catch (error) {
      return null;
    }
  }
}

module.exports = JWTUtils;

