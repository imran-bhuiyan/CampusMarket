//Products Service

import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { CreateProductDto, UpdateProductDto } from './dto';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface GetProductsQuery {
  page?: number;
  limit?: number;
  category?: string;
  department?: string;
  search?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, user: User): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      sellerId: user.id,
    });

    return this.productRepository.save(product);
  }

  async findAll(query: GetProductsQuery): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 20, category, department, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller')
      .where('product.isAvailable = :isAvailable', { isAvailable: true });

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (department) {
      queryBuilder.andWhere('product.department LIKE :department', {
        department: `%${department}%`,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(product.title LIKE :search OR product.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['seller'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    user: User,
  ): Promise<Product> {
    const product = await this.findOne(id);

    // Check ownership (unless admin)
    if (product.sellerId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only update your own products');
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number, user: User): Promise<void> {
    const product = await this.findOne(id);

    // Check ownership (unless admin)
    if (product.sellerId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.productRepository.remove(product);
  }
}
