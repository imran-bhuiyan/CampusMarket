// ============================================
// CampusMarket Express - Database Seed Script
// ============================================
// This replaces NestJS seed.ts for populating demo data.
// Uses raw SQL queries with mysql2.

require('dotenv').config();

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function seed() {
  // Create connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_DATABASE || 'campus_market',
  });

  console.log('📦 Database connected');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create admin user first
  const [existingAdmin] = await connection.execute(
    'SELECT id FROM users WHERE email = ?',
    ['admin@campus.edu']
  );

  if (existingAdmin.length === 0) {
    await connection.execute(
      `INSERT INTO users (email, password, name, department, role, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'admin', NOW(), NOW())`,
      ['admin@campus.edu', hashedPassword, 'Admin User', 'Administration']
    );
    console.log('👑 Admin created: Admin User');
  }

  // Create demo users
  const usersData = [
    { email: 'sarah.chen@campus.edu', name: 'Sarah Chen', department: 'CSE' },
    { email: 'james.wilson@campus.edu', name: 'James Wilson', department: 'EEE' },
    { email: 'emily.rodriguez@campus.edu', name: 'Emily Rodriguez', department: 'BBA' },
    { email: 'michael.ahmed@campus.edu', name: 'Michael Ahmed', department: 'ME' },
    { email: 'priya.sharma@campus.edu', name: 'Priya Sharma', department: 'CSE' },
    { email: 'david.kim@campus.edu', name: 'David Kim', department: 'CSE' },
    { email: 'lisa.johnson@campus.edu', name: 'Lisa Johnson', department: 'BBA' },
  ];

  const userIds = [];
  for (const userData of usersData) {
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [userData.email]
    );

    if (existing.length === 0) {
      const [result] = await connection.execute(
        `INSERT INTO users (email, password, name, department, role, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, 'user', NOW(), NOW())`,
        [userData.email, hashedPassword, userData.name, userData.department]
      );
      userIds.push(result.insertId);
      console.log(`✅ User created: ${userData.name}`);
    } else {
      userIds.push(existing[0].id);
    }
  }

  // Clear existing products
  try {
    await connection.execute('TRUNCATE TABLE products');
    console.log('🗑️  Cleared existing products');
  } catch (err) {
    if (err.code !== 'ER_NO_SUCH_TABLE') {
      throw err;
    }
  }

  // Sample products
  const products = [
    {
      title: 'Calculus Textbook - Stewart 8th Edition',
      description: 'Used for MATH 101. Great condition, some highlighting.',
      price: 45.00,
      category: 'books',
      condition: 'good',
      department: 'CSE',
      images: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      sellerId: userIds[0],
      moderationStatus: 'approved',
    },
    {
      title: 'MacBook Pro 2021 - M1 Pro',
      description: '14-inch, 16GB RAM, 512GB SSD. Excellent condition.',
      price: 1200.00,
      category: 'electronics',
      condition: 'like_new',
      department: 'CSE',
      images: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      sellerId: userIds[4],
      moderationStatus: 'approved',
    },
    {
      title: 'TI-84 Plus Calculator',
      description: 'Texas Instruments graphing calculator. Works perfectly.',
      price: 60.00,
      category: 'electronics',
      condition: 'good',
      department: 'EEE',
      images: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400',
      sellerId: userIds[1],
      moderationStatus: 'approved',
    },
    {
      title: 'University Hoodie - Size M',
      description: 'Official campus hoodie in navy blue. Perfect condition.',
      price: 35.00,
      category: 'clothing',
      condition: 'like_new',
      department: 'CSE',
      images: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      sellerId: userIds[5],
      moderationStatus: 'approved',
    },
    {
      title: 'Ergonomic Office Chair',
      description: 'Adjustable office chair with lumbar support.',
      price: 85.00,
      category: 'furniture',
      condition: 'good',
      department: 'CSE',
      images: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400',
      sellerId: userIds[0],
      moderationStatus: 'approved',
    },
    {
      title: 'Gaming Monitor 27" 144Hz',
      description: 'ASUS gaming monitor, 1440p resolution.',
      price: 220.00,
      category: 'electronics',
      condition: 'good',
      department: 'CSE',
      images: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
      sellerId: userIds[5],
      moderationStatus: 'pending',
    },
  ];

  for (const product of products) {
    await connection.execute(
      `INSERT INTO products (title, description, price, category, \`condition\`, department, images, sellerId, moderationStatus, isAvailable, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW(), NOW())`,
      [
        product.title,
        product.description,
        product.price,
        product.category,
        product.condition,
        product.department,
        product.images,
        product.sellerId,
        product.moderationStatus,
      ]
    );
    console.log(`✅ Created: ${product.title}`);
  }

  console.log('\n🎉 Seed completed!');
  await connection.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
