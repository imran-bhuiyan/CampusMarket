// ============================================
// CampusMarket Express - Auth Controller
// ============================================
// This replaces NestJS AuthController and AuthService.
// Handles registration, login, profile fetching, and profile picture upload.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * POST /auth/register
 * Replaces: AuthController.register() and AuthService.register()
 * 
 * Creates a new user account with hashed password and returns JWT token.
 */
async function register(req, res) {
  try {
    const { email, password, name, department } = req.body;

    // Check if user already exists (equivalent to NestJS ConflictException)
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered', statusCode: 409 });
    }

    // Hash password with bcrypt (salt rounds: 10, same as NestJS)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.execute(
      `INSERT INTO users (email, password, name, department, role, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'user', NOW(), NOW())`,
      [email, hashedPassword, name, department]
    );

    const userId = result.insertId;

    // Fetch the created user (without password)
    const [users] = await pool.execute(
      'SELECT id, email, name, department, profilePicture, role, createdAt, updatedAt FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];

    // Generate JWT token (same payload structure as NestJS)
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return same response shape as NestJS
    res.status(201).json({
      user,
      accessToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
}

/**
 * POST /auth/login
 * Replaces: AuthController.login() and AuthService.login()
 * 
 * Validates credentials and returns JWT token.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await pool.execute(
      'SELECT id, email, password, name, department, profilePicture, role, createdAt, updatedAt FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Same error message as NestJS UnauthorizedException
      return res.status(401).json({ message: 'Invalid credentials', statusCode: 401 });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials', statusCode: 401 });
    }

    // Generate JWT token
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
}

/**
 * GET /auth/profile
 * Replaces: AuthController.getProfile() and AuthService.getProfile()
 * 
 * Returns the authenticated user's profile.
 * Requires: authMiddleware
 */
async function getProfile(req, res) {
  try {
    // User is already attached by authMiddleware
    const userId = req.user.id;

    const [users] = await pool.execute(
      'SELECT id, email, name, department, profilePicture, role, createdAt, updatedAt FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found', statusCode: 401 });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
}

/**
 * PATCH /auth/profile/picture
 * Replaces: AuthController.uploadProfilePicture() and AuthService.updateProfilePicture()
 * 
 * Uploads a profile picture and updates the user record.
 * Requires: authMiddleware, uploadProfilePicture middleware
 */
async function uploadProfilePicture(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded', statusCode: 400 });
    }

    const userId = req.user.id;
    const filename = req.file.filename;

    // Update user's profile picture path (same format as NestJS)
    const profilePicturePath = `/uploads/profiles/${filename}`;

    await pool.execute(
      'UPDATE users SET profilePicture = ?, updatedAt = NOW() WHERE id = ?',
      [profilePicturePath, userId]
    );

    // Fetch and return updated user
    const [users] = await pool.execute(
      'SELECT id, email, name, department, profilePicture, role, createdAt, updatedAt FROM users WHERE id = ?',
      [userId]
    );

    res.json(users[0]);
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  uploadProfilePicture,
};
