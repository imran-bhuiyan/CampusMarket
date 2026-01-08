// ============================================
// CampusMarket - Product Entity
// ============================================

import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export type ProductCategory = 'books' | 'electronics' | 'clothing' | 'furniture' | 'other';
export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: ['books', 'electronics', 'clothing', 'furniture', 'other'] })
  category: ProductCategory;

  @Column({ type: 'enum', enum: ['new', 'like_new', 'good', 'fair'] })
  condition: ProductCondition;

  @Column()
  department: string;

  @Column('simple-array')
  images: string[];

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  moderationStatus: ModerationStatus;

  @Column({ default: true })
  isAvailable: boolean;

  @Column()
  sellerId: number;

  @ManyToOne(() => User, (user) => user.products, { eager: true })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
