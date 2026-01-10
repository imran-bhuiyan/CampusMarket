// ============================================
// CampusMarket Express - Admin Controller
// ============================================
// Handles admin dashboard operations with REAL database queries
// for statistics, user management, and moderation.

const { pool } = require('../config/db');

/**
 * GET /admin/stats
 * Returns dashboard statistics from database
 */
async function getStats(req, res) {
  try {
    // Get total users count
    const [userResult] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const totalUsers = userResult[0]?.count || 0;

    // Get active (approved) listings count
    const [activeListingResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM products WHERE moderationStatus = 'approved' AND isAvailable = 1"
    );
    const activeListings = activeListingResult[0]?.count || 0;

    // Get pending listings count
    const [pendingResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM products WHERE moderationStatus = 'pending'"
    );
    const pendingListings = pendingResult[0]?.count || 0;

    // Get banned users count (as reports proxy)
    const [bannedResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM users WHERE isBanned = 1"
    );
    const pendingReports = bannedResult[0]?.count || 0;

    // Get new users this week
    const [newUsersResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    const newUsersThisWeek = newUsersResult[0]?.count || 0;

    // Get new listings this week
    const [newListingsResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM products WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    const newListingsThisWeek = newListingsResult[0]?.count || 0;

    res.json({
      totalUsers,
      activeListings,
      pendingReports,
      pendingListings,
      newUsersThisWeek,
      newListingsThisWeek,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', statusCode: 500 });
  }
}

/**
 * GET /admin/users
 * Returns list of all users from database
 */
async function getUsers(req, res) {
  try {
    const [users] = await pool.execute(
      `SELECT id, name, email, department, role, profilePicture, 
              IFNULL(isBanned, 0) as isBanned, createdAt, updatedAt 
       FROM users 
       WHERE role != 'admin'
       ORDER BY createdAt DESC`
    );

    // Format date for display
    const formattedUsers = users.map(user => ({
      ...user,
      isBanned: Boolean(user.isBanned),
      createdAt: new Date(user.createdAt).toISOString().split('T')[0],
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users', statusCode: 500 });
  }
}

/**
 * PATCH /admin/users/:id/ban
 * Bans a user in the database
 */
async function banUser(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    console.log(`[Admin] Attempting to BAN user ID: ${userId}`);

    // Check if user exists
    const [users] = await pool.execute('SELECT id, name, isBanned FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      console.log(`[Admin] User ID ${userId} not found`);
      return res.status(404).json({ message: 'User not found', statusCode: 404 });
    }

    console.log(`[Admin] Found user: ${users[0].name}, current ban status: ${users[0].isBanned}`);

    // Update user ban status
    const [result] = await pool.execute(
      'UPDATE users SET isBanned = 1, updatedAt = NOW() WHERE id = ?',
      [userId]
    );

    console.log(`[Admin] Update result: affectedRows=${result.affectedRows}`);

    res.json({
      message: `User ${users[0].name} has been banned`,
      userId,
      isBanned: true,
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Failed to ban user', statusCode: 500 });
  }
}

/**
 * PATCH /admin/users/:id/unban
 * Unbans a user in the database
 */
async function unbanUser(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    console.log(`[Admin] Attempting to UNBAN user ID: ${userId}`);

    // Check if user exists
    const [users] = await pool.execute('SELECT id, name, isBanned FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      console.log(`[Admin] User ID ${userId} not found`);
      return res.status(404).json({ message: 'User not found', statusCode: 404 });
    }

    console.log(`[Admin] Found user: ${users[0].name}, current ban status: ${users[0].isBanned}`);

    // Update user ban status
    const [result] = await pool.execute(
      'UPDATE users SET isBanned = 0, updatedAt = NOW() WHERE id = ?',
      [userId]
    );

    console.log(`[Admin] Update result: affectedRows=${result.affectedRows}`);

    res.json({
      message: `User ${users[0].name} has been unbanned`,
      userId,
      isBanned: false,
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ message: 'Failed to unban user', statusCode: 500 });
  }
}

module.exports = {
  getStats,
  getUsers,
  banUser,
  unbanUser,
};
