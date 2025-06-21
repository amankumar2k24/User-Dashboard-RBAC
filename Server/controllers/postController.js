const { Op } = require('sequelize');
const { Post, User } = require('../models');

const createPost = async (req, res) => {
    try {
        const { title, category, description, tags, status, featured, readingTime, excerpt } = req.body;

        const post = await Post.create({
            title, category, description, tags,
            status, featured, readingTime, excerpt,
            authorId: req.user.id
        });

        res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({ where: { authorId: req.user.id } });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const where = search ? {
            [Op.or]: [
                { title: { [Op.like]: `%${search}%` } },
                { category: { [Op.like]: `%${search}%` } }
            ]
        } : {};

        const posts = await Post.findAll({
            where,
            limit: parseInt(limit, 10),
            offset,
            include: [
                {
                    model: User,
                    as: 'author', 
                    attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
                }
            ]
        });

        const totalPosts = await Post.count({ where });

        res.status(200).json({
            posts,
            pagination: {
                totalPosts
            }
        });
    } catch (error) {
        console.log("error==>❌❌", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id);

        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.authorId !== req.user.id) {
            return res.status(403).json({ message: 'You can only update your own posts' });
        }

        await post.update(req.body);
        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deletePost = async (req, res) => {
    // console.log("req.user.role==>", req.user.role)
    const role = req.user.role.dataValues.name
    try {
        const { id } = req.params;

        const post = await Post.findByPk(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can delete posts' });
        }

        await post.destroy();
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createPost,
    getMyPosts,
    getAllPosts,
    updatePost,
    deletePost
}