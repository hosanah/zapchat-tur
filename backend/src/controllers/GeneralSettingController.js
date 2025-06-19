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
      const { guidelines } = req.body;
      const logoBuffer = req.file ? req.file.buffer : undefined;

      let setting = await GeneralSetting.findOne({ where: { company_id: companyId } });
      if (setting) {
        await setting.update({
          ...(logoBuffer !== undefined && { logo: logoBuffer }),
          guidelines,
        });
      } else {
        setting = await GeneralSetting.create({
          company_id: companyId,
          logo: logoBuffer,
          guidelines,
        });
      }
      res.status(200).json({ success: true, data: { setting } });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = GeneralSettingController;
