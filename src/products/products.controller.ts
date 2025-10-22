import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto.js';

/**
 * Solicitud para obtener un producto por ID.
 */
interface GetProductByIdRequest {
  id: string;
}

/**
 * Solicitud para eliminar un producto.
 */
interface DeleteProductRequest {
  id: string;
}

/**
 * Controlador gRPC para la gestión de productos.
 */
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  /**
   * Solicitud para crear un nuevo producto.
   * @param data Datos del producto a crear.
   * @returns Resultado de la operación de creación.
   */
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

  /**
   * Solicitud para obtener todos los productos.
   * @returns Resultado de la operación de obtención.
   */
  @GrpcMethod('ProductsService', 'GetProducts')
  getProducts() {
    return this.productsService.findAll();
  }

  /**
   * Solicitud para obtener un producto por ID.
   * @param data Datos de la solicitud que incluyen el ID del producto a obtener.
   * @returns Resultado de la operación de obtención.
   */
  @GrpcMethod('ProductsService', 'GetProductById')
  getProductById(data: GetProductByIdRequest) {
    return this.productsService.findById(data.id);
  }

  /**
   * Solicitud para actualizar un producto.
   * @param data Datos de la solicitud que incluyen el ID del producto a actualizar.
   * @returns Resultado de la operación de actualización.
   */
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
      // Convertir a número solo si está definido
      price: data.price !== undefined ? Number(data.price) : undefined,
      category: data.category,
      newImageData: data.newImageData,
    };
    return this.productsService.update(dto);
  }

  /**
   * Solicitud para eliminar un producto.
   * @param data Datos de la solicitud que incluyen el ID del producto a eliminar.
   * @returns Resultado de la operación de eliminación.
   */
  @GrpcMethod('ProductsService', 'DeleteProduct')
  deleteProduct(data: DeleteProductRequest) {
    return this.productsService.delete(data.id);
  }
}
