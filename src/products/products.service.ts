// src/products/products.service.ts

import { Injectable } from '@nestjs/common';
// Importamos el Repositorio
import { ProductsRepository } from './products.repository';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

// ... (otros imports)
import { Product, ProductDocument } from './schemas/product.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Lógica para CREAR un producto
   */
  async create(createProductDto: CreateProductDto) {
    const { name, description, price, category, imageData } = createProductDto;

    // 1. Lógica de Negocio: Validar que el nombre sea único
    const existingProduct = await this.productsRepository.findByName(name);
    if (existingProduct) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: `El producto con el nombre "${name}" ya existe.`,
      });
    }

    // 2. Lógica de Negocio: Validar el Buffer
    if (!imageData || imageData.length === 0) {
      // ESTE ERA UN ERROR
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'La imagen (imageData) es requerida y no puede estar vacía.',
      });
    }

    // 3. Lógica de Negocio: Subir la imagen
    let imageUrl: string;
    try {
      imageUrl = await this.cloudinaryService.uploadImage(imageData);
    } catch (error) {
      // ESTE ERA UN ERROR
      throw new RpcException({
        code: status.INTERNAL,
        message: `Error al subir la imagen a Cloudinary: ${error.message}`,
      });
    }

    // 4. Llama al Repositorio para guardar
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
   * Lógica para LISTAR todos los productos
   */
  async findAll() {
    const products = await this.productsRepository.findAll();
    return {
      products: products.map((p) => this.mapProductToProto(p)),
    };
  }

  /**
   * Lógica para BUSCAR un producto por ID
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
   */
  async update(updateProductDto: UpdateProductDto) {
    const { id, name, newImageData, ...updateData } = updateProductDto;

    // 1. Lógica de Negocio: Validar que el producto exista
    const product = await this.productsRepository.findById(id);
    if (!product) {
      // ESTE ERA UN ERROR
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Producto con ID "${id}" no encontrado.`,
      });
    }

    // 2. Lógica de Negocio: Validar nombre único
    if (name && name !== product.name) {
      const existing = await this.productsRepository.findByName(name);
      if (existing) {
        // ESTE ERA UN ERROR
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: `El producto con el nombre "${name}" ya existe.`,
        });
      }
      updateData['name'] = name;
    }

    // 3. Lógica de Negocio: Subir nueva imagen
    if (newImageData && newImageData.length > 0) {
      try {
        const newImageUrl = await this.cloudinaryService.uploadImage(
          newImageData,
        );
        updateData['imageUrl'] = newImageUrl;
      } catch (error) {
        // ESTE ERA UN ERROR
        throw new RpcException({
          code: status.INTERNAL,
          message: `Error al subir la nueva imagen: ${error.message}`,
        });
      }
    }

    // 4. Llama al Repositorio para actualizar
    const updatedProduct = await this.productsRepository.update(id, updateData);

    return { product: this.mapProductToProto(updatedProduct) };
  }

  /**
   * Lógica para ELIMINAR (Soft Delete) un producto
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
   * Helper (sigue igual)
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