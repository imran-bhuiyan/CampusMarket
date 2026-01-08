//Products Controller

import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: { user: User },
  ) {
    return this.productsService.create(createProductDto, req.user);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('department') department?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      category,
      department,
      search,
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('pending')
  findPending() {
    return this.productsService.findPending();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.approveProduct(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.rejectProduct(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: { user: User },
  ) {
    return this.productsService.update(id, updateProductDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: User },
  ) {
    return this.productsService.remove(id, req.user);
  }
}
