// ============================================
// CampusMarket Express - Products Routes
// ============================================
// This replaces NestJS @Controller('products') decorator routing.
// Maps HTTP methods to controller functions with middleware.

const express = require('express');
const router = express.Router();

const productsController = require('../controllers/products.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validateCreateProduct, validateUpdateProduct } = require('../middleware/validation');

/**
 * GET /products
 * Public route - no auth required
 * Replaces: @Get() in NestJS
 * 
 * Query params: page, limit, category, department, search
 */
router.get('/', productsController.getProducts);

/**
 * GET /products/pending
 * Protected route - requires JWT + Admin role
 * Replaces: @UseGuards(JwtAuthGuard, AdminGuard) @Get('pending') in NestJS
 * 
 * NOTE: This route MUST be defined BEFORE /:id to avoid matching 'pending' as an ID
 */
router.get('/pending', authMiddleware, adminMiddleware, productsController.getPendingProducts);

/**
 * GET /products/:id
 * Public route - no auth required
 * Replaces: @Get(':id') in NestJS
 */
router.get('/:id', productsController.getProduct);

/**
 * POST /products
 * Protected route - requires JWT
 * Replaces: @UseGuards(JwtAuthGuard) @Post() in NestJS
 */
router.post('/', authMiddleware, validateCreateProduct, productsController.createProduct);

/**
 * PATCH /products/:id/approve
 * Protected route - requires JWT + Admin role
 * Replaces: @UseGuards(JwtAuthGuard, AdminGuard) @Patch(':id/approve') in NestJS
 * 
 * NOTE: This route MUST be defined BEFORE generic /:id PATCH
 */
router.patch('/:id/approve', authMiddleware, adminMiddleware, productsController.approveProduct);

/**
 * PATCH /products/:id/reject
 * Protected route - requires JWT + Admin role
 * Replaces: @UseGuards(JwtAuthGuard, AdminGuard) @Patch(':id/reject') in NestJS
 */
router.patch('/:id/reject', authMiddleware, adminMiddleware, productsController.rejectProduct);

/**
 * PATCH /products/:id
 * Protected route - requires JWT (ownership check in controller)
 * Replaces: @UseGuards(JwtAuthGuard) @Patch(':id') in NestJS
 */
router.patch('/:id', authMiddleware, validateUpdateProduct, productsController.updateProduct);

/**
 * DELETE /products/:id
 * Protected route - requires JWT (ownership check in controller)
 * Replaces: @UseGuards(JwtAuthGuard) @Delete(':id') in NestJS
 */
router.delete('/:id', authMiddleware, productsController.deleteProduct);

module.exports = router;
