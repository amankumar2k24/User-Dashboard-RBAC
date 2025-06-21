const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Role, RefreshToken } = require('../models');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');
const redisClient = require('../config/redis');
const { Op } = require('sequelize');

const generateTokens = async (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  await RefreshToken.create({
    token: refreshToken,
    userId,
    expiryDate
  });

  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;
    const profileImage = req.file ? req.file.filename : null;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profileImage,
      emailVerificationToken
    });

    await emailService.sendVerificationEmail(email, emailVerificationToken);

    res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email: email },
      include: {
        model: Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Access denied. Your account has been deactivated. Please contact support for assistance.'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = await generateTokens(user.id);

    await redisClient.setEx(`user_${user.id}`, 3600, JSON.stringify({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: {
        name: user.role.name,
        permissions: user.role.permissions
      }
    }));

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        role: {
          name: user.role.name,
          permissions: user.role.permissions
        }
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    // console.log("token==>", token)
    const user = await User.findOne({
      where: { emailVerificationToken: token }
    });

    // console.log("user==>", user)

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); 
    const hashedToken = await bcrypt.hash(resetToken, 12);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    try {
      await emailService.sendPasswordResetEmail(email, resetToken);
      res.json({ message: 'If the email exists, a reset link has been sent' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters with uppercase, lowercase, and number' });
    }

    const user = await User.findOne({
      where: {
        passwordResetExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const isTokenValid = await bcrypt.compare(token, user.passwordResetToken);
    if (!isTokenValid) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const refreshTokenDoc = await RefreshToken.findOne({
      where: { token, isRevoked: false }
    });

    if (!refreshTokenDoc || refreshTokenDoc.expiryDate < new Date()) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(decoded.userId);

    refreshTokenDoc.isRevoked = true;
    await refreshTokenDoc.save();

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await redisClient.setEx(`blacklist_${token}`, 900, 'true');
    }

    if (req.user?.id) {
      await RefreshToken.update(
        { isRevoked: true },
        { where: { userId: req.user.id, isRevoked: false } }
      );
      await redisClient.del(`user_${req.user.id}`);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout
};
