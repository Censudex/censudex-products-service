import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProductsRepository } from './products.repository'; // <-- 1. Importa

/**
 * Módulo de productos para la gestión de productos en la aplicación.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CloudinaryModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository, 
  ],
})
export class ProductsModule {}