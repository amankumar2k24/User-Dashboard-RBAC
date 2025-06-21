const { body } = require('express-validator');

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('New password must be at least 8 characters with uppercase, lowercase and number')
]

module.exports = {
    changePasswordValidation
}