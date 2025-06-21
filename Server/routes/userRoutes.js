const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../config/multer');
const { changePasswordValidation } = require('../validator/userValidator');

const router = express.Router();

// Profile routes
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, upload.single('profileImage'), userController.updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, userController.changePassword);

// Admin only routes
router.get('/', authenticateToken, authorize('admin'), userController.getUsers);
router.get('/:id', authenticateToken, authorize('admin'), userController.getUserById);
router.delete('/:id', authenticateToken, authorize('admin'), userController.deleteUser);

module.exports = router;
