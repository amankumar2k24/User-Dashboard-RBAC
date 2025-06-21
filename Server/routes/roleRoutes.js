const express = require('express');
const { authenticateToken, authorize } = require('../middleware/auth');
const roleController = require('../controllers/roleController');
const { createRoleValidation, updateRoleValidation } = require('../validator/roleValidator');

const router = express.Router();

router.get('/', authenticateToken, authorize('admin', 'user'), roleController.getRoles);
router.get('/:id', authenticateToken, authorize('admin', 'user'), roleController.getRoleById);
router.post('/', authenticateToken, authorize('admin'), createRoleValidation, roleController.createRole);
router.put('/:id', authenticateToken, authorize('admin'), updateRoleValidation, roleController.updateRole);


module.exports = router;