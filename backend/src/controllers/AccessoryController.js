const { Accessory, Company } = require('../models');
const { validationResult } = require('express-validator');

class AccessoryController {
  static async getAll(req, res, next) {
    try {
      const accessories = await Accessory.findAll({
        where: { company_id: req.user.company_id },
        order: [['name', 'ASC']]
      });
      res.json({ success: true, data: { accessories } });
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
