const { Role } = require('../models');
const redisClient = require('../config/redis');

exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    const role = await Role.create({ name, permissions });

    await redisClient.del('roles:all').catch(err => {
      console.error('Redis cache invalidation error:', err);
    });

    res.status(201).json({ message: 'Role created successfully', role });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const cacheKey = 'roles:all';
    let roles = await redisClient.get(cacheKey).then(data => data ? JSON.parse(data) : null).catch(err => {
      console.error('Redis get error:', err);
      return null;
    });

    if (!roles) {
      roles = await Role.findAll({
        attributes: ['id', 'name', 'permissions', 'createdAt', 'updatedAt']
      });
      // console.log("DB roles=>", roles);
      if (!roles.length) {
        return res.status(404).json({ message: 'No roles found' });
      }
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(roles)).catch(err => {
        console.error('Redis set error:', err);
      });
    }

    res.json({ message: 'Roles retrieved successfully', roles });
  } catch (error) {
    console.error('Error fetching roles:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `role:${id}`;
    let role = await redisClient.get(cacheKey).then(data => data ? JSON.parse(data) : null).catch(() => null);

    if (!role) {
      role = await Role.findByPk(id, {
        attributes: ['id', 'name', 'permissions', 'createdAt', 'updatedAt']
      });

      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      await redisClient.setEx(cacheKey, 3600, JSON.stringify(role)).catch(err => {
        console.error('Redis cache error:', err);
      });
    }

    res.json({ message: 'Role retrieved successfully', role });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    await role.update({ name, permissions });
    res.status(200).json({ message: 'Role updated successfully', role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
