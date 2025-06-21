const { User, Role } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const redisClient = require('../config/redis');

const getProfile = async (req, res) => {
  // console.log("req.user==>", req.user.id)
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const profileImage = req.file ? req.file.filename : undefined;

    const updateData = { firstName, lastName };
    if (profileImage) {
      updateData.profileImage = profileImage;
    }

    await User.update(updateData, {
      where: { id: req.user.id }
    });

    const updatedUser = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] }
    });

    await redisClient.setEx(`user_${req.user.id}`, 3600, JSON.stringify({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role.name
    }));

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (search) {
      whereCondition[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const cacheKey = `users_${page}_${limit}_${search}_${sortBy}_${sortOrder}`;
    const cachedUsers = await redisClient.get(cacheKey);

    if (cachedUsers) {
      return res.json(JSON.parse(cachedUsers));
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereCondition,
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken', 'passwordResetExpires'] },
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const result = {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalUsers: count,
        hasNext: page * limit < count,
        hasPrev: page > 1
      }
    };
    await redisClient.setEx(cacheKey, 300, JSON.stringify(result));

    res.json(result);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken', 'passwordResetExpires'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("req.user.id=========>", req.user.id)
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.update({ isActive: false }, { where: { id } });

    const cachePattern = 'users_*';
    const keys = await redisClient.keys(cachePattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await User.update(
      { password: hashedPassword },
      { where: { id: req.user.id } }
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  getUserById,
  deleteUser,
  changePassword
};
