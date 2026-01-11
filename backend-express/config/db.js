// ============================================
// CampusMarket Express - Database Configuration
// ============================================
// This replaces NestJS TypeOrmModule with mysql2 promise-based connection pool.
// We use raw SQL queries instead of an ORM for simplicity.

const mysql = require('mysql2/promise');

const DB_NAME = process.env.DB_DATABASE || 'campus_market';

// Create a connection pool (reuses connections efficiently)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize database and tables if missing
async function initDatabase() {
  try {
    // Connect without database to create DB if it doesn't exist
    const adminConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD ?? '',
      multipleStatements: true,
    });

    await adminConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await adminConn.end();

    // Use pool to create tables if not exist
    const conn = await pool.getConnection();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NULL,
        profilePicture VARCHAR(512) NULL,
        role ENUM('user','admin') NOT NULL DEFAULT 'user',
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(64) NOT NULL,
        \`condition\` VARCHAR(64) NOT NULL,
        department VARCHAR(255) NOT NULL,
        images TEXT NULL,
        sellerId INT NOT NULL,
        moderationStatus ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        isAvailable TINYINT(1) NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        INDEX idx_seller (sellerId),
        CONSTRAINT fk_products_user FOREIGN KEY (sellerId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    conn.release();
    console.log('🛠️  Database initialized (schema verified)');
  } catch (error) {
    console.warn('⚠️  Database initialization skipped or failed:', error.message);
  }
}

// Test the connection (non-fatal)
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.warn('❌ Database connection failed:', error.message);
  }
}

module.exports = { pool, initDatabase, testConnection };
