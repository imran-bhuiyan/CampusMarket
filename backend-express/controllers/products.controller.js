// ============================================
// CampusMarket Express - Products Controller
// ============================================
// This replaces NestJS ProductsController and ProductsService.
// Handles CRUD operations, ownership checks, and admin moderation.

const { pool } = require('../config/db');

/**
 * Helper function to format product with seller info
 * Replicates TypeORM eager loading of seller relation
 */
function formatProduct(product) {
  // Parse images from comma-separated string (TypeORM simple-array format)
  const images = product.images ? product.images.split(',').filter(Boolean) : [];

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: parseFloat(product.price), // MySQL decimal comes as string
    category: product.category,
    condition: product.condition,
    department: product.department,
    images,
    moderationStatus: product.moderationStatus,
    isAvailable: Boolean(product.isAvailable),
    sellerId: product.sellerId,
    // Full seller info to match NestJS TypeORM eager loading
    seller: product.sellerName ? {
      id: product.sellerId,
      email: product.sellerEmail,
      name: product.sellerName,
      department: product.sellerDepartment,
      phone: product.sellerPhone || null,
      profilePicture: product.sellerProfilePicture || null,
      role: product.sellerRole,
      createdAt: product.sellerCreatedAt,
      updatedAt: product.sellerUpdatedAt,
    } : null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * POST /products
 * Replaces: ProductsController.create() and ProductsService.create()
 * 
 * Creates a new product listing for the authenticated user.
 * Requires: authMiddleware
 */
async function createProduct(req, res) {
  try {
    const { title, description, price, category, condition, department, images } = req.body;
    const sellerId = req.user.id;

    // Store images as comma-separated string (TypeORM simple-array format)
    const imagesStr = Array.isArray(images) ? images.join(',') : '';

    const [result] = await pool.execute(
      `INSERT INTO products (title, description, price, category, \`condition\`, department, images, sellerId, moderationStatus, isAvailable, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', true, NOW(), NOW())`,
      [title, description, price, category, condition, department, imagesStr, sellerId]
    );

    const productId = result.insertId;

    // Fetch the created product with seller info
    const [products] = await pool.execute(
      `SELECT p.*, u.name as sellerName, u.email as sellerEmail, u.department as sellerDepartment,
              u.phone as sellerPhone, u.profilePicture as sellerProfilePicture, u.role as sellerRole,
              u.createdAt as sellerCreatedAt, u.updatedAt as sellerUpdatedAt
       FROM products p
       LEFT JOIN users u ON p.sellerId = u.id
       WHERE p.id = ?`,
      [productId]
    );

    res.status(201).json(formatProduct(products[0]));
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
}

/**
 * GET /products
 * Replaces: ProductsController.findAll() and ProductsService.findAll()
 * 
 * Returns paginated list of available, approved products with optional filters.
 * Public route - no auth required.
 */
async function getProducts(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;
    const { category, department, search } = req.query;

    // Build query dynamically (replicates TypeORM QueryBuilder)
    let whereClause = 'WHERE p.isAvailable = 1 AND p.moderationStatus = ?';
    const params = ['approved'];

    if (category) {
      whereClause += ' AND p.category = ?';
      params.push(category);
    }

    if (department) {
      whereClause += ' AND p.department LIKE ?';
      params.push(`%${department}%`);
    }

    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM products p ${whereClause}`,
      params
    );
    const total = parseInt(countResult[0].total) || 0;

    // Get paginated products with seller info
    const [products] = await pool.execute(
      `SELECT p.*, u.name as sellerName, u.email as sellerEmail, u.department as sellerDepartment,
              u.phone as sellerPhone, u.profilePicture as sellerProfilePicture, u.role as sellerRole,
              u.createdAt as sellerCreatedAt, u.updatedAt as sellerUpdatedAt
       FROM products p
       LEFT JOIN users u ON p.sellerId = u.id
       ${whereClause}
       ORDER BY p.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Return same response shape as NestJS PaginatedResponse
    res.json({
      data: products.map(formatProduct),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get products error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
}

/**
 * GET /products/pending
 * Replaces: ProductsController.findPending() and ProductsService.findPending()
 * 
 * Returns all pending products for admin moderation.
 * Requires: authMiddleware, adminMiddleware
 */
async function getPendingProducts(req, res) {
  try {
    const [products] = await pool.execute(
      `SELECT p.*, u.name as sellerName, u.email as sellerEmail, u.department as sellerDepartment,
              u.phone as sellerPhone, u.profilePicture as sellerProfilePicture, u.role as sellerRole,
              u.createdAt as sellerCreatedAt, u.updatedAt as sellerUpdatedAt
       FROM products p
       LEFT JOIN users u ON p.sellerId = u.id
       WHERE p.moderationStatus = 'pending'
       ORDER BY p.createdAt DESC`
    );

    res.json(products.map(formatProduct));
  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
}

/**
 * GET /products/:id
 * Replaces: ProductsController.findOne() and ProductsService.findOne()
 * 
 * Returns a single product by ID.
 * Public route - no auth required.
 */
async function getProduct(req, res) {
  try {
    const { id } = req.params;

    const [products] = await pool.execute(
      `SELECT p.*, u.name as sellerName, u.email as sellerEmail, u.department as sellerDepartment,
              u.phone as sellerPhone, u.profilePicture as sellerProfilePicture, u.role as sellerRole,
              u.createdAt as sellerCreatedAt, u.updatedAt as sellerUpdatedAt
       FROM products p
       LEFT JOIN users u ON p.sellerId = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      // Same error format as NestJS NotFoundException
      return res.status(404).json({ message: `Product with ID ${id} not found`, statusCode: 404 });
    }

    res.json(formatProduct(products[0]));
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
}

/**
 * PATCH /products/:id
 * Replaces: ProductsController.update() and ProductsService.update()
 * 
 * Updates a product. Only the owner or admin can update.
 * Requires: authMiddleware
 */
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // First, fetch the product to check ownership
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: `Product with ID ${id} not found`, statusCode: 404 });
    }

    const product = products[0];

    // Check ownership (unless admin) - same as NestJS ForbiddenException
    if (product.sellerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own products', statusCode: 403 });
    }

    // Build dynamic UPDATE query for partial updates
    const updates = [];
    const values = [];

    const allowedFields = ['title', 'description', 'price', 'category', 'condition', 'department', 'images', 'isAvailable'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'images') {
          updates.push('images = ?');
          values.push(Array.isArray(req.body.images) ? req.body.images.join(',') : '');
        } else if (field === 'condition') {
          // condition is a reserved word in MySQL, needs backticks
          updates.push('`condition` = ?');
          values.push(req.body[field]);
        } else {
          updates.push(`${field} = ?`);
          values.push(req.body[field]);
        }
      }
    }

    if (updates.length > 0) {
      updates.push('updatedAt = NOW()');
      values.push(id);

      await pool.execute(
        `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Fetch and return updated product
    const [updatedProducts] = await pool.execute(
      `SELECT p.*, u.name as sellerName, u.email as sellerEmail, u.department as sellerDepartment,
              u.phone as sellerPhone, u.profilePicture as sellerProfilePicture, u.role as sellerRole,
              u.createdAt as sellerCreatedAt, u.updatedAt as sellerUpdatedAt
       FROM products p
       LEFT JOIN users u ON p.sellerId = u.id
       WHERE p.id = ?`,
      [id]
    );

    res.json(formatProduct(updatedProducts[0]));
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
}

/**
 * DELETE /products/:id
 * Replaces: ProductsController.remove() and ProductsService.remove()
 * 
 * Deletes a product. Only the owner or admin can delete.
 * Requires: authMiddleware
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // First, fetch the product to check ownership
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: `Product with ID ${id} not found`, statusCode: 404 });
    }

    const product = products[0];

    // Check ownership (unless admin)
    if (product.sellerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own products', statusCode: 403 });
    }

    await pool.execute('DELETE FROM products WHERE id = ?', [id]);

    // NestJS returns void, Express sends empty response or success message
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
}

/**
 * PATCH /products/:id/approve
 * Replaces: ProductsController.approve() and ProductsService.approveProduct()
 * 
 * Approves a pending product (admin only).
 * Requires: authMiddleware, adminMiddleware
 */
async function approveProduct(req, res) {
  try {
    const { id } = req.params;

    // Check if product exists
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: `Product with ID ${id} not found`, statusCode: 404 });
    }

    // Update moderation status
    await pool.execute(
      'UPDATE products SET moderationStatus = ?, updatedAt = NOW() WHERE id = ?',
      ['approved', id]
    );

    // Fetch and return updated product
    const [updatedProducts] = await pool.execute(
      `SELECT p.*, u.name as sellerName, u.email as sellerEmail, u.department as sellerDepartment,
              u.phone as sellerPhone, u.profilePicture as sellerProfilePicture, u.role as sellerRole,
              u.createdAt as sellerCreatedAt, u.updatedAt as sellerUpdatedAt
       FROM products p
       LEFT JOIN users u ON p.sellerId = u.id
       WHERE p.id = ?`,
      [id]
    );

    res.json(formatProduct(updatedProducts[0]));
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
}

/**
 * PATCH /products/:id/reject
 * Replaces: ProductsController.reject() and ProductsService.rejectProduct()
 * 
 * Rejects a pending product (admin only).
 * Requires: authMiddleware, adminMiddleware
 */
async function rejectProduct(req, res) {
  try {
    const { id } = req.params;

    // Check if product exists
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: `Product with ID ${id} not found`, statusCode: 404 });
    }

    // Update moderation status and availability (same as NestJS)
    await pool.execute(
      'UPDATE products SET moderationStatus = ?, isAvailable = false, updatedAt = NOW() WHERE id = ?',
      ['rejected', id]
    );

    // Fetch and return updated product
    const [updatedProducts] = await pool.execute(
      `SELECT p.*, u.name as sellerName, u.email as sellerEmail, u.department as sellerDepartment,
              u.phone as sellerPhone, u.profilePicture as sellerProfilePicture, u.role as sellerRole,
              u.createdAt as sellerCreatedAt, u.updatedAt as sellerUpdatedAt
       FROM products p
       LEFT JOIN users u ON p.sellerId = u.id
       WHERE p.id = ?`,
      [id]
    );

    res.json(formatProduct(updatedProducts[0]));
  } catch (error) {
    console.error('Reject product error:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  getPendingProducts,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
};
