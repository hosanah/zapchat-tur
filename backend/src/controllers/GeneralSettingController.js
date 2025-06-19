const { GeneralSetting } = require('../models');
const { validationResult } = require('express-validator');

class GeneralSettingController {
  static async get(req, res, next) {
    try {
      const companyId = req.user.company_id;
      const setting = await GeneralSetting.findOne({ where: { company_id: companyId } });
      res.status(200).json({ success: true, data: { setting } });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const companyId = req.user.company_id;
      const { logo, guidelines } = req.body;
      let setting = await GeneralSetting.findOne({ where: { company_id: companyId } });
      if (setting) {
        await setting.update({ logo, guidelines });
      } else {
        setting = await GeneralSetting.create({ company_id: companyId, logo, guidelines });
      }
      res.status(200).json({ success: true, data: { setting } });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const companyId = req.user.company_id;
      const { logo, guidelines } = req.body;

      const existing = await GeneralSetting.findOne({ where: { company_id: companyId } });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Configurações já cadastradas'
        });
      }

      const setting = await GeneralSetting.create({ company_id: companyId, logo, guidelines });
      res.status(201).json({ success: true, data: { setting } });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const companyId = req.user.company_id;
      const setting = await GeneralSetting.findOne({ where: { company_id: companyId } });
      if (!setting) {
        return res.status(404).json({
          success: false,
          error: 'Configurações não encontradas'
        });
      }

      await setting.destroy();
      res.status(200).json({ success: true, message: 'Configurações removidas' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = GeneralSettingController;
