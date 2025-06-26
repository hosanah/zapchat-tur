const { Accessory, Company } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class AccessoryController {
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      const where = { company_id: req.user.company_id };
      if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
      }

      const { count, rows: accessories } = await Accessory.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']]
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: {
          accessories,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) { next(error); }
  }

  static async getById(req, res, next) {
    try {
      const accessory = await Accessory.findByPk(req.params.id);
      if (!accessory || accessory.company_id !== req.user.company_id) {
        return res.status(404).json({ success: false, error: 'Acessório não encontrado' });
      }
      res.json({ success: true, data: { accessory } });
    } catch (error) { next(error); }
  }

  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
      }
      const data = { ...req.body };
      if (!req.user.isMaster()) data.company_id = req.user.company_id;
      const company = await Company.findByPk(data.company_id);
      if (!company) return res.status(400).json({ success: false, error: 'Empresa não encontrada' });
      const accessory = await Accessory.create(data);
      res.status(201).json({ success: true, message: 'Acessório criado', data: { accessory } });
    } catch (error) { next(error); }
  }

  static async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
      }
      const accessory = await Accessory.findByPk(req.params.id);
      if (!accessory || accessory.company_id !== req.user.company_id) {
        return res.status(404).json({ success: false, error: 'Acessório não encontrado' });
      }
      await accessory.update(req.body);
      res.json({ success: true, message: 'Acessório atualizado', data: { accessory } });
    } catch (error) { next(error); }
  }

  static async delete(req, res, next) {
    try {
      const accessory = await Accessory.findByPk(req.params.id);
      if (!accessory || accessory.company_id !== req.user.company_id) {
        return res.status(404).json({ success: false, error: 'Acessório não encontrado' });
      }
      await accessory.destroy();
      res.json({ success: true, message: 'Acessório excluído' });
    } catch (error) { next(error); }
  }
}

module.exports = AccessoryController;
