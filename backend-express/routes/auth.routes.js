// ============================================
// CampusMarket Express - Auth Routes
// ============================================
// This replaces NestJS @Controller('auth') decorator routing.
// Maps HTTP methods to controller functions with middleware.

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { uploadProfilePicture } = require('../middleware/upload');

/**
 * POST /auth/register
 * Public route - no auth required
 * Replaces: @Post('register') in NestJS
 */
router.post('/register', validateRegister, authController.register);

/**
 * POST /auth/login
 * Public route - no auth required
 * Replaces: @Post('login') in NestJS
 */
router.post('/login', validateLogin, authController.login);

/**
 * GET /auth/profile
 * Protected route - requires JWT
 * Replaces: @UseGuards(JwtAuthGuard) @Get('profile') in NestJS
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * PATCH /auth/profile/picture
 * Protected route - requires JWT + file upload
 * Replaces: @UseGuards(JwtAuthGuard) @Patch('profile/picture') @UseInterceptors(FileInterceptor) in NestJS
 */
router.patch('/profile/picture', authMiddleware, uploadProfilePicture, authController.uploadProfilePicture);

module.exports = router;
