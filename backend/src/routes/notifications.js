const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticate } = require('../middleware/auth');
const notificationValidations = require('../middleware/notificationValidations');

router.use(authenticate);

router.get('/', NotificationController.listByUser);
router.get('/unread-count', NotificationController.getUnreadCount);
router.post('/', notificationValidations.create, NotificationController.create);
router.get('/:id', notificationValidations.validateId, NotificationController.getById);
router.put('/:id', notificationValidations.validateId, NotificationController.update);
router.delete('/:id', notificationValidations.validateId, NotificationController.delete);
router.patch('/:id/read', notificationValidations.validateId, NotificationController.markAsRead);

module.exports = router;
