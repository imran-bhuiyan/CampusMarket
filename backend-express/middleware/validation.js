// ============================================
// CampusMarket Express - Validation Middleware
// ============================================
// This replaces NestJS ValidationPipe with class-validator DTOs.
// We use simple validation functions for each request type.

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Register Request Body
 * Replaces: RegisterDto with class-validator decorators
 */
function validateRegister(req, res, next) {
  const { email, password, name, department } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('email must be a valid email address');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('password must be at least 6 characters');
  }
  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('name should not be empty');
  }
  if (!department || typeof department !== 'string' || department.trim() === '') {
    errors.push('department should not be empty');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors, error: 'Bad Request', statusCode: 400 });
  }

  next();
}

/**
 * Validate Login Request Body
 * Replaces: LoginDto with class-validator decorators
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('email must be a valid email address');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors, error: 'Bad Request', statusCode: 400 });
  }

  next();
}

/**
 * Validate Create Product Request Body
 * Replaces: CreateProductDto with class-validator decorators
 */
function validateCreateProduct(req, res, next) {
  const { title, description, price, category, condition, department, images } = req.body;
  const errors = [];

  const validCategories = ['books', 'electronics', 'clothing', 'furniture', 'other'];
  const validConditions = ['new', 'like_new', 'good', 'fair'];

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('title should not be empty');
  }
  if (!description || typeof description !== 'string' || description.trim() === '') {
    errors.push('description should not be empty');
  }
  if (typeof price !== 'number' || price < 0) {
    errors.push('price must be a non-negative number');
  }
  if (!category || !validCategories.includes(category)) {
    errors.push(`category must be one of: ${validCategories.join(', ')}`);
  }
  if (!condition || !validConditions.includes(condition)) {
    errors.push(`condition must be one of: ${validConditions.join(', ')}`);
  }
  if (!department || typeof department !== 'string' || department.trim() === '') {
    errors.push('department should not be empty');
  }
  if (!Array.isArray(images) || !images.every(img => typeof img === 'string')) {
    errors.push('images must be an array of strings');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors, error: 'Bad Request', statusCode: 400 });
  }

  next();
}

/**
 * Validate Update Product Request Body (partial)
 * Replaces: UpdateProductDto (PartialType of CreateProductDto)
 */
function validateUpdateProduct(req, res, next) {
  const { title, description, price, category, condition, department, images } = req.body;
  const errors = [];

  const validCategories = ['books', 'electronics', 'clothing', 'furniture', 'other'];
  const validConditions = ['new', 'like_new', 'good', 'fair'];

  // All fields are optional, but if provided, must be valid
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    errors.push('title should not be empty');
  }
  if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
    errors.push('description should not be empty');
  }
  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    errors.push('price must be a non-negative number');
  }
  if (category !== undefined && !validCategories.includes(category)) {
    errors.push(`category must be one of: ${validCategories.join(', ')}`);
  }
  if (condition !== undefined && !validConditions.includes(condition)) {
    errors.push(`condition must be one of: ${validConditions.join(', ')}`);
  }
  if (department !== undefined && (typeof department !== 'string' || department.trim() === '')) {
    errors.push('department should not be empty');
  }
  if (images !== undefined && (!Array.isArray(images) || !images.every(img => typeof img === 'string'))) {
    errors.push('images must be an array of strings');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors, error: 'Bad Request', statusCode: 400 });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateProduct,
  validateUpdateProduct,
};
