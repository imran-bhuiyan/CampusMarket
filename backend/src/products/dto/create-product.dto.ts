// ============================================
// CampusMarket - Create Product DTO
// ============================================

import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(['books', 'electronics', 'clothing', 'furniture', 'other'])
  category: 'books' | 'electronics' | 'clothing' | 'furniture' | 'other';

  @IsEnum(['new', 'like_new', 'good', 'fair'])
  condition: 'new' | 'like_new' | 'good' | 'fair';

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsArray()
  @IsString({ each: true })
  images: string[];
}
