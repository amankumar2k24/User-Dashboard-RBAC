const { body } = require('express-validator');

const createRoleValidation = [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Role name must be 2-50 characters'),
    body('permissions').isObject().withMessage('Permissions must be a valid JSON object')
]
const updateRoleValidation = [
    body('name').optional().isString(),
    body('permissions').optional().isObject()
]

module.exports = {
    createRoleValidation,
    updateRoleValidation
}