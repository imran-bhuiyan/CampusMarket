// CampusMarket - Database Seed Script

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

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create admin user first
  let adminUser = await userRepo.findOne({ where: { email: 'admin@campus.edu' } });
  if (!adminUser) {
    adminUser = userRepo.create({
      email: 'admin@campus.edu',
      name: 'Admin User',
      department: 'Administration',
      password: hashedPassword,
      role: 'admin',
    });
    await userRepo.save(adminUser);
    console.log(`👑 Admin created: ${adminUser.name}`);
  }

  // Create multiple users with real names
  const usersData = [
    { email: 'sarah.chen@campus.edu', name: 'Sarah Chen', department: 'CSE' },
    { email: 'james.wilson@campus.edu', name: 'James Wilson', department: 'EEE' },
    { email: 'emily.rodriguez@campus.edu', name: 'Emily Rodriguez', department: 'BBA' },
    { email: 'michael.ahmed@campus.edu', name: 'Michael Ahmed', department: 'ME' },
    { email: 'priya.sharma@campus.edu', name: 'Priya Sharma', department: 'CSE' },
    { email: 'david.kim@campus.edu', name: 'David Kim', department: 'CSE' },
    { email: 'lisa.johnson@campus.edu', name: 'Lisa Johnson', department: 'BBA' },
  ];

  const users: User[] = [];
  for (const userData of usersData) {
    let user = await userRepo.findOne({ where: { email: userData.email } });
    if (!user) {
      user = userRepo.create({
        ...userData,
        password: hashedPassword,
        role: 'user',
      });
      await userRepo.save(user);
      console.log(`✅ User created: ${user.name}`);
    }
    users.push(user);
  }

  // Clear existing products for fresh seed (if table exists)
  try {
    await AppDataSource.query('TRUNCATE TABLE products');
    console.log('🗑️  Cleared existing products');
  } catch (err: any) {
    if (err.code !== 'ER_NO_SUCH_TABLE') {
      throw err;
    }
    console.log('📝 Product table will be created');
  }

  // Sample products with different sellers
  const products = [
    {
      title: 'Calculus Textbook - Stewart 8th Edition',
      description: 'Used for MATH 101. Great condition, some highlighting. Perfect for first-year students.',
      price: 45.00,
      category: 'books' as const,
      condition: 'good' as const,
      department: 'CSE',
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'],
      sellerId: users[0].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'MacBook Pro 2021 - M1 Pro',
      description: '14-inch, 16GB RAM, 512GB SSD. Excellent condition, includes charger. Upgraded to new laptop.',
      price: 1200.00,
      category: 'electronics' as const,
      condition: 'like_new' as const,
      department: 'CSE',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
      sellerId: users[4].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'Physics Lab Manual',
      description: 'University Physics Lab Manual for PHYS 201. Barely used, no writing inside.',
      price: 25.00,
      category: 'books' as const,
      condition: 'like_new' as const,
      department: 'EEE',
      images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'],
      sellerId: users[1].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'TI-84 Plus Calculator',
      description: 'Texas Instruments graphing calculator. Works perfectly, new batteries included.',
      price: 60.00,
      category: 'electronics' as const,
      condition: 'good' as const,
      department: 'EEE',
      images: ['https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400'],
      sellerId: users[1].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'Organic Chemistry Textbook',
      description: 'McMurry Organic Chemistry 9th Edition. Required for CHEM 301. Minor wear on cover.',
      price: 55.00,
      category: 'books' as const,
      condition: 'good' as const,
      department: 'BBA',
      images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400'],
      sellerId: users[2].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'Desk Lamp - LED Study Light',
      description: 'Adjustable LED desk lamp with USB charging port. 3 brightness levels. Like new.',
      price: 20.00,
      category: 'furniture' as const,
      condition: 'like_new' as const,
      department: 'ME',
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'],
      sellerId: users[3].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'Arduino Starter Kit',
      description: 'Complete Arduino Uno starter kit with sensors, LEDs, breadboard. Great for ECE projects.',
      price: 35.00,
      category: 'electronics' as const,
      condition: 'new' as const,
      department: 'EEE',
      images: ['https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400'],
      sellerId: users[1].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'Business Statistics Textbook',
      description: 'Statistics for Business and Economics, 13th Edition. Good condition with some notes.',
      price: 40.00,
      category: 'books' as const,
      condition: 'fair' as const,
      department: 'BBA',
      images: ['https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400'],
      sellerId: users[2].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'Mechanical Engineering Handbook',
      description: 'Shigley\'s Mechanical Engineering Design, 11th Edition. Essential for ME students.',
      price: 65.00,
      category: 'books' as const,
      condition: 'good' as const,
      department: 'ME',
      images: ['https://images.unsplash.com/photo-1589998059171-988d887df646?w=400'],
      sellerId: users[3].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'Wireless Keyboard & Mouse Combo',
      description: 'Logitech MK270 wireless combo. Used for one semester, works great.',
      price: 25.00,
      category: 'electronics' as const,
      condition: 'good' as const,
      department: 'CSE',
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'],
      sellerId: users[0].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    // Clothing items
    {
      title: 'University Hoodie - Size M',
      description: 'Official campus hoodie in navy blue. Worn only a few times, perfect condition.',
      price: 35.00,
      category: 'clothing' as const,
      condition: 'like_new' as const,
      department: 'CSE',
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'],
      sellerId: users[5].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'Lab Coat - White',
      description: 'Professional white lab coat, size L. Required for chemistry and biology labs.',
      price: 18.00,
      category: 'clothing' as const,
      condition: 'good' as const,
      department: 'EEE',
      images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'],
      sellerId: users[1].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'Business Formal Blazer - Navy',
      description: 'Professional navy blazer, size S. Perfect for presentations and interviews.',
      price: 50.00,
      category: 'clothing' as const,
      condition: 'like_new' as const,
      department: 'BBA',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'],
      sellerId: users[6].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    // More furniture items
    {
      title: 'Ergonomic Office Chair',
      description: 'Adjustable office chair with lumbar support. Great for long study sessions.',
      price: 85.00,
      category: 'furniture' as const,
      condition: 'good' as const,
      department: 'CSE',
      images: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400'],
      sellerId: users[0].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'Portable Whiteboard',
      description: 'Double-sided magnetic whiteboard with stand. Includes markers and eraser.',
      price: 30.00,
      category: 'furniture' as const,
      condition: 'new' as const,
      department: 'ME',
      images: ['https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=400'],
      sellerId: users[3].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    // Items pending moderation (for admin testing)
    {
      title: 'Gaming Monitor 27" 144Hz',
      description: 'ASUS gaming monitor, 1440p resolution, 144Hz refresh rate. Minor scratch on stand.',
      price: 220.00,
      category: 'electronics' as const,
      condition: 'good' as const,
      department: 'CSE',
      images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'],
      sellerId: users[5].id,
      moderationStatus: 'pending' as const,
      isAvailable: true,
    },
    {
      title: 'Python Programming Book',
      description: 'Learning Python, 5th Edition by Mark Lutz. Great for beginners.',
      price: 30.00,
      category: 'books' as const,
      condition: 'good' as const,
      department: 'CSE',
      images: ['https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400'],
      sellerId: users[4].id,
      moderationStatus: 'pending' as const,
      isAvailable: true,
    },
    {
      title: 'Vintage Denim Jacket',
      description: 'Classic denim jacket, size M. Retro style, great condition.',
      price: 40.00,
      category: 'clothing' as const,
      condition: 'good' as const,
      department: 'BBA',
      images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400'],
      sellerId: users[6].id,
      moderationStatus: 'pending' as const,
      isAvailable: true,
    },
    // Sold items (not available)
    {
      title: 'iPad Air 4th Gen',
      description: '64GB, Space Gray with Apple Pencil 2. Used for note-taking.',
      price: 450.00,
      category: 'electronics' as const,
      condition: 'like_new' as const,
      department: 'CSE',
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'],
      sellerId: users[0].id,
      moderationStatus: 'approved' as const,
      isAvailable: false,
    },
    {
      title: 'Standing Desk Converter',
      description: 'Adjustable standing desk converter. Fits on any desk.',
      price: 120.00,
      category: 'furniture' as const,
      condition: 'good' as const,
      department: 'ME',
      images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400'],
      sellerId: users[3].id,
      moderationStatus: 'approved' as const,
      isAvailable: false,
    },
    // Other category items
    {
      title: 'Backpack - Waterproof',
      description: 'Large capacity waterproof backpack with laptop compartment. 15.6" laptop fits.',
      price: 45.00,
      category: 'other' as const,
      condition: 'like_new' as const,
      department: 'CSE',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'],
      sellerId: users[5].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'Noise Cancelling Headphones',
      description: 'Sony WH-1000XM4 headphones. Amazing sound quality and noise cancellation.',
      price: 180.00,
      category: 'electronics' as const,
      condition: 'like_new' as const,
      department: 'EEE',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
      sellerId: users[1].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'Mini Fridge for Dorm',
      description: 'Compact mini fridge, perfect for dorm rooms. Works great, quiet operation.',
      price: 70.00,
      category: 'other' as const,
      condition: 'good' as const,
      department: 'BBA',
      images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400'],
      sellerId: users[2].id,
      moderationStatus: 'approved' as const,
      isAvailable: true,
    },
    {
      title: 'Yoga Mat',
      description: 'Extra thick yoga mat with carrying strap. Non-slip surface.',
      price: 22.00,
      category: 'other' as const,
      condition: 'new' as const,
      department: 'ME',
      images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'],
      sellerId: users[3].id,
      moderationStatus: 'approved' as const,
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
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
