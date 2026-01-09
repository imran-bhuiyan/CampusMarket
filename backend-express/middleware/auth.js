// ============================================
// CampusMarket Express - JWT Authentication Middleware
// ============================================
// This replaces NestJS JwtAuthGuard and JwtStrategy.
// It validates the JWT token from Authorization header and attaches user to request.

const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * JWT Authentication Middleware
 * Replaces: @UseGuards(JwtAuthGuard) in NestJS
 * 
 * Extracts Bearer token from Authorization header, verifies it,
 * fetches the user from database, and attaches to req.user
 */
async function authMiddleware(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized', statusCode: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token', statusCode: 401 });
    }

    // Fetch user from database (equivalent to JwtStrategy.validate())
    const [rows] = await pool.execute(
      'SELECT id, email, name, department, profilePicture, role, createdAt, updatedAt FROM users WHERE id = ?',
      [payload.sub]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'User not found', statusCode: 401 });
    }

    // Attach user to request (like NestJS does with @Request() req.user)
    req.user = rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
}

/**
 * Admin Guard Middleware
 * Replaces: @UseGuards(AdminGuard) in NestJS
 * 
 * Must be used AFTER authMiddleware. Checks if user has admin role.
 */
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required', statusCode: 403 });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };
