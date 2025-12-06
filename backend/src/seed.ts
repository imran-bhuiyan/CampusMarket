// ============================================
// CampusMarket - Database Seed Script
// ============================================

import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { User } from './entities/user.entity';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'campus_market',
  entities: [User, Product],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('📦 Database connected');

  const userRepo = AppDataSource.getRepository(User);
  const productRepo = AppDataSource.getRepository(Product);

  // Create demo user
  let demoUser = await userRepo.findOne({ where: { email: 'demo@campus.edu' } });
  
  if (!demoUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    demoUser = userRepo.create({
      email: 'demo@campus.edu',
      password: hashedPassword,
      name: 'Demo Student',
      department: 'Computer Science',
      role: 'user',
    });
    await userRepo.save(demoUser);
    console.log('✅ Demo user created');
  }

  // Check if products exist
  const existingProducts = await productRepo.count();
  if (existingProducts > 0) {
    console.log(`ℹ️  ${existingProducts} products already exist`);
    await AppDataSource.destroy();
    return;
  }

  // Sample products
  const products = [
    {
      title: 'Calculus Textbook - Stewart 8th Edition',
      description: 'Used for MATH 101. Great condition, some highlighting. Perfect for first-year students.',
      price: 45.00,
      category: 'books' as const,
      condition: 'good' as const,
      department: 'Mathematics',
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'],
      sellerId: demoUser.id,
      isAvailable: true,
    },
    {
      title: 'MacBook Pro 2021 - M1 Pro',
      description: '14-inch, 16GB RAM, 512GB SSD. Excellent condition, includes charger. Upgraded to new laptop.',
      price: 1200.00,
      category: 'electronics' as const,
      condition: 'like_new' as const,
      department: 'Computer Science',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
      sellerId: demoUser.id,
      isAvailable: true,
    },
    {
      title: 'Physics Lab Manual',
      description: 'University Physics Lab Manual for PHYS 201. Barely used, no writing inside.',
      price: 25.00,
      category: 'books' as const,
      condition: 'like_new' as const,
      department: 'Physics',
      images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'],
      sellerId: demoUser.id,
      isAvailable: true,
    },
    {
      title: 'TI-84 Plus Calculator',
      description: 'Texas Instruments graphing calculator. Works perfectly, new batteries included.',
      price: 60.00,
      category: 'electronics' as const,
      condition: 'good' as const,
      department: 'Engineering',
      images: ['https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400'],
      sellerId: demoUser.id,
      isAvailable: true,
    },
    {
      title: 'Organic Chemistry Textbook',
      description: 'McMurry Organic Chemistry 9th Edition. Required for CHEM 301. Minor wear on cover.',
      price: 55.00,
      category: 'books' as const,
      condition: 'good' as const,
      department: 'Chemistry',
      images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400'],
      sellerId: demoUser.id,
      isAvailable: true,
    },
    {
      title: 'Desk Lamp - LED Study Light',
      description: 'Adjustable LED desk lamp with USB charging port. 3 brightness levels. Like new.',
      price: 20.00,
      category: 'furniture' as const,
      condition: 'like_new' as const,
      department: 'General',
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'],
      sellerId: demoUser.id,
      isAvailable: true,
    },
    {
      title: 'Arduino Starter Kit',
      description: 'Complete Arduino Uno starter kit with sensors, LEDs, breadboard. Great for ECE projects.',
      price: 35.00,
      category: 'electronics' as const,
      condition: 'new' as const,
      department: 'Electrical Engineering',
      images: ['https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400'],
      sellerId: demoUser.id,
      isAvailable: true,
    },
    {
      title: 'Business Statistics Textbook',
      description: 'Statistics for Business and Economics, 13th Edition. Good condition with some notes.',
      price: 40.00,
      category: 'books' as const,
      condition: 'fair' as const,
      department: 'Business Administration',
      images: ['https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400'],
      sellerId: demoUser.id,
      isAvailable: true,
    },
  ];

  for (const productData of products) {
    const product = productRepo.create(productData);
    await productRepo.save(product);
    console.log(`✅ Created: ${product.title}`);
  }

  console.log('\n🎉 Seed completed!');
  await AppDataSource.destroy();
}

seed().catch(console.error);
