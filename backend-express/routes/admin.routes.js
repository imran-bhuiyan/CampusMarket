// ============================================
// CampusMarket Express - Admin Routes
// ============================================
// Routes for admin dashboard functionality.
// All routes require admin authentication.

const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// Admin middleware - checks if user has admin role
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            message: 'Admin access required',
            statusCode: 403
        });
    }
    next();
};

router.use(requireAdmin);

// ============================================
// Admin Dashboard Routes
// ============================================

/**
 * GET /admin/stats
 * Get dashboard statistics
 */
router.get('/stats', adminController.getStats);

/**
 * GET /admin/users
 * Get list of all users with ban status
 */
router.get('/users', adminController.getUsers);

/**
 * PATCH /admin/users/:id/ban
 * Ban a user
 */
router.patch('/users/:id/ban', adminController.banUser);

/**
 * PATCH /admin/users/:id/unban
 * Unban a user
 */
router.patch('/users/:id/unban', adminController.unbanUser);

module.exports = router;
