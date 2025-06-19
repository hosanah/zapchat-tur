const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticate } = require('../middleware/auth');
const { body, param } = require('express-validator');

router.use(authenticate);

router.post('/',
  body('content').isString().notEmpty(),
  NotificationController.create
);

router.get('/', NotificationController.list);

router.patch('/:id/read',
  param('id').isUUID(),
  NotificationController.markRead
);

module.exports = router;
