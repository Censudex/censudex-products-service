import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto.js';

interface GetProductByIdRequest {
  id: string;
}

interface DeleteProductRequest {
  id: string;
}

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @GrpcMethod('ProductsService', 'CreateProduct')
  createProduct(data: { [key: string]: any; image_data: Buffer }) {
    const dto: CreateProductDto = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      category: data.category,
      imageData: data.imageData,
    };
    return this.productsService.create(dto);
  }

  // VVV ¡ES MUY PROBABLE QUE EL TYPO ESTÉ AQUÍ! VVV
  @GrpcMethod('ProductsService', 'GetProducts')
  getProducts() {
    return this.productsService.findAll();
  }

  @GrpcMethod('ProductsService', 'GetProductById')
  getProductById(data: GetProductByIdRequest) {
    return this.productsService.findById(data.id);
  }

  @GrpcMethod('ProductsService', 'UpdateProduct')
  updateProduct(data: {
    [key: string]: any;
    id: string;
    new_image_data?: Buffer;
  }) {
    const dto: UpdateProductDto = {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price !== undefined ? Number(data.price) : undefined,
      category: data.category,
      newImageData: data.newImageData,
    };
    return this.productsService.update(dto);
  }

  @GrpcMethod('ProductsService', 'DeleteProduct')
  deleteProduct(data: DeleteProductRequest) {
    return this.productsService.delete(data.id);
  }
}
