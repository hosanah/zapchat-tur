const { Notification } = require('../models');
const { validationResult } = require('express-validator');

class NotificationController {
  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
      }
      const userId = req.body.user_id || req.user.id;
      const notification = await Notification.create({
        content: req.body.content,
        user_id: userId
      });
      res.status(201).json({ success: true, data: { notification } });
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const notifications = await Notification.findAll({
        where: { user_id: req.user.id },
        order: [['createdAt', 'DESC']]
      });
      res.status(200).json({ success: true, data: { notifications } });
    } catch (err) {
      next(err);
    }
  }

  static async markRead(req, res, next) {
    try {
      const notification = await Notification.findOne({
        where: { id: req.params.id, user_id: req.user.id }
      });
      if (!notification) {
        return res.status(404).json({ success: false, error: 'Notificação não encontrada' });
      }
      await notification.update({ read: true });
      res.status(200).json({ success: true, data: { notification } });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NotificationController;
