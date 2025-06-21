const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const redisClient = require('../config/redis');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const isBlacklisted = await redisClient.get(`blacklist_${token}`);
    // console.log("Is token blacklisted=>", isBlacklisted);
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token is invalid' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded token=>", decoded);
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error=>", error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = req.user.role?.name || req.user.role;
    // console.log("User role=>", userRole);
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authenticateToken, authorize };