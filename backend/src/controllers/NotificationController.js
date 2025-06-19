const { Notification, User } = require('../models');
const { validationResult } = require('express-validator');

class NotificationController {
  static async listByUser(req, res, next) {
    try {
      const notifications = await Notification.findAll({
        where: { user_id: req.user.id },
        order: [['createdAt', 'DESC']]
      });
      res.status(200).json({ success: true, data: { notifications } });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await Notification.findOne({
        where: { id, user_id: req.user.id }
      });
      if (!notification) {
        return res.status(404).json({ success: false, error: 'Notificação não encontrada' });
      }
      res.status(200).json({ success: true, data: { notification } });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
      }

      const targetUserId = req.body.user_id || req.user.id;

      if (!req.user.isMaster() && !req.user.isAdmin() && targetUserId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }

      const user = await User.findByPk(targetUserId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      }

      const notification = await Notification.create({
        user_id: targetUserId,
        message: req.body.message
      });

      res.status(201).json({ success: true, message: 'Notificação criada', data: { notification } });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await Notification.findOne({ where: { id, user_id: req.user.id } });
      if (!notification) {
        return res.status(404).json({ success: false, error: 'Notificação não encontrada' });
      }

      if (req.body.message) {
        notification.message = req.body.message;
      }
      if (typeof req.body.read === 'boolean') {
        notification.read = req.body.read;
      }

      await notification.save();

      res.status(200).json({ success: true, message: 'Notificação atualizada', data: { notification } });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await Notification.findOne({ where: { id, user_id: req.user.id } });
      if (!notification) {
        return res.status(404).json({ success: false, error: 'Notificação não encontrada' });
      }
      await notification.destroy();
      res.status(200).json({ success: true, message: 'Notificação removida' });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await Notification.findOne({ where: { id, user_id: req.user.id } });
      if (!notification) {
        return res.status(404).json({ success: false, error: 'Notificação não encontrada' });
      }
      notification.read = true;
      await notification.save();
      res.status(200).json({ success: true, message: 'Notificação marcada como lida', data: { notification } });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req, res, next) {
    try {
      const count = await Notification.count({
        where: { user_id: req.user.id, read: false }
      });
      res.status(200).json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
