const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../config/multer');
const { registerValidation, loginValidation } = require('../validator/authValidator');

const router = express.Router();

router.post('/register', upload.single('profileImage'), registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
