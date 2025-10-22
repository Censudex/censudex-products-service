import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { Product, ProductDocument } from './schemas/product.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

/**
 * Servicio para la gestión de productos.
 */
@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Lógica para CREAR un producto
   * @param createProductDto Campos necesarios para crear un producto
   * @returns Resultado de la creación del producto
   */
  async create(createProductDto: CreateProductDto) {
    const { name, description, price, category, imageData } = createProductDto;
    const existingProduct = await this.productsRepository.findByName(name);
    if (existingProduct) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: `El producto con el nombre "${name}" ya existe.`,
      });
    }

    if (!imageData || imageData.length === 0) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'La imagen (imageData) es requerida y no puede estar vacía.',
      });
    }

    let imageUrl: string;
    try {
      imageUrl = await this.cloudinaryService.uploadImage(imageData);
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: `Error al subir la imagen a Cloudinary: ${error.message}`,
      });
    }

    const savedProduct = await this.productsRepository.create({
      name,
      description,
      price,
      category,
      imageUrl,
    });

    return { product: this.mapProductToProto(savedProduct) };
  }

  /**
   * Lógica para OBTENER todos los productos
   * @returns Lista de productos
   */
  async findAll() {
    const products = await this.productsRepository.findAll();
    return {
      products: products.map((p) => this.mapProductToProto(p)),
    };
  }

  /**
   * Lógica para OBTENER un producto por ID
   * @param id ID del producto a obtener
   * @returns Producto encontrado o un error si no existe
   */
  async findById(id: string) {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Producto con ID "${id}" no encontrado.`,
      });
    }

    return { product: this.mapProductToProto(product) };
  }

  /**
   * Lógica para ACTUALIZAR un producto
   * @param updateProductDto Campos necesarios para actualizar un producto
   * @returns Producto actualizado o un error si no existe
   */
  async update(updateProductDto: UpdateProductDto) {
    const { id, name, newImageData, ...updateData } = updateProductDto;

    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Producto con ID "${id}" no encontrado.`,
      });
    }

    if (name && name !== product.name) {
      const existing = await this.productsRepository.findByName(name);
      if (existing) {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: `El producto con el nombre "${name}" ya existe.`,
        });
      }
      updateData['name'] = name;
    }

    if (newImageData && newImageData.length > 0) {
      try {
        const newImageUrl =
          await this.cloudinaryService.uploadImage(newImageData);
        updateData['imageUrl'] = newImageUrl;
      } catch (error) {
        throw new RpcException({
          code: status.INTERNAL,
          message: `Error al subir la nueva imagen: ${error.message}`,
        });
      }
    }

    const updatedProduct = await this.productsRepository.update(id, updateData);

    return { product: this.mapProductToProto(updatedProduct) };
  }

  /**
   * Lógica para ELIMINAR un producto
   * @param id ID del producto a eliminar
   * @returns Producto eliminado o un error si no existe
   */
  async delete(id: string) {
    const updatedProduct = await this.productsRepository.softDelete(id);

    if (!updatedProduct) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Producto con ID "${id}" no encontrado.`,
      });
    }

    return { product: this.mapProductToProto(updatedProduct) };
  }

  /**
   * Mapea un documento de producto a su representación en el protocolo (gRPC).
   * @param product Documento de producto
   * @returns Representación del producto en el protocolo
   */
  private mapProductToProto(product: ProductDocument | null) {
    if (!product) {
      return null;
    }
    return {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      status: product.status,
      createdAt: product.createdAt.toISOString(),
    };
  }
}
