const { Trip, Company } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class TripController {
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search, company_id, status } = req.query;
      const offset = (page - 1) * limit;
      const where = {};

      if (!req.user.isMaster()) {
        where.company_id = req.user.company_id;
      } else if (company_id) {
        where.company_id = company_id;
      }

      if (search) {
        where.title = { [Op.iLike]: `%${search}%` };
      }

      if (status) {
        where.status = status;
      }

      const { count, rows } = await Trip.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: { trips: rows, total: count },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const trip = await Trip.findByPk(req.params.id);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Passeio não encontrado' });
      }
      if (!req.user.isMaster() && trip.company_id !== req.user.company_id) {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }
      res.status(200).json({ success: true, data: { trip } });
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
      const data = req.body;
      if (!req.user.isMaster()) {
        data.company_id = req.user.company_id;
      }
      const company = await Company.findByPk(data.company_id);
      if (!company) {
        return res.status(400).json({ success: false, error: 'Empresa não encontrada' });
      }
      const trip = await Trip.create(data);
      res.status(201).json({ success: true, data: { trip } });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
      }
      const trip = await Trip.findByPk(req.params.id);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Passeio não encontrado' });
      }
      if (!req.user.isMaster() && trip.company_id !== req.user.company_id) {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }
      delete req.body.company_id;
      await trip.update(req.body);
      res.status(200).json({ success: true, data: { trip } });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const trip = await Trip.findByPk(req.params.id);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Passeio não encontrado' });
      }
      if (!req.user.isMaster() && trip.company_id !== req.user.company_id) {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }
      await trip.destroy();
      res.status(200).json({ success: true, message: 'Passeio excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
      }

      const trip = await Trip.findByPk(req.params.id);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Passeio não encontrado' });
      }

      if (!req.user.isMaster() && trip.company_id !== req.user.company_id) {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }

      const { status } = req.body;
      await trip.update({ status });

      res.status(200).json({ success: true, data: { trip }, message: 'Status atualizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TripController;
