const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Arquivo de imagem inválido'));
  }
};

const uploadLogo = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
}).single('logo');

module.exports = uploadLogo;
