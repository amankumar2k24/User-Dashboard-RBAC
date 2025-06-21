const express = require('express');
const { authenticateToken, authorize } = require('../middleware/auth');
const postController = require('../controllers/postController');

const router = express.Router();

router.post('/', authenticateToken, postController.createPost);
router.get('/my-posts', authenticateToken, postController.getMyPosts);
router.get('/', authenticateToken, postController.getAllPosts);
router.put('/:id', authenticateToken, postController.updatePost);
router.delete('/:id', authenticateToken, authorize('admin'), postController.deletePost);

module.exports = router;
