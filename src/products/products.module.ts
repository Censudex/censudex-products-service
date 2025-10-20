import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; 
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema'; 
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; 

@Module({
  imports: [
    // Configura el esquema de Producto en Mongoose
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CloudinaryModule, 
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}