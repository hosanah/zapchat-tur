const { GeneralSetting } = require('../models');

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
}

module.exports = GeneralSettingController;
