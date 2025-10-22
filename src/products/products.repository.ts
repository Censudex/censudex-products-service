import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

/**
 * Repositorio para la gestión de productos en la base de datos.
 */
@Injectable()
export class ProductsRepository {
  /**
   * Inicializa una nueva instancia del repositorio de productos.
   * @param productModel Modelo de producto de Mongoose
   */
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Busca un producto por su nombre.
   * @param name Nombre del producto a buscar.
   * @returns El producto encontrado o null si no se encuentra.
   */
  async findByName(name: string): Promise<ProductDocument | null> {
    return this.productModel.findOne({ name }).exec();
  }

  /**
   * Busca un producto por su ID.
   * @param id ID del producto a buscar.
   * @returns El producto encontrado o null si no se encuentra.
   */
  async findById(id: string): Promise<ProductDocument | null> {
    return this.productModel.findById(id).exec();
  }

  /**
   * Busca todos los productos.
   * @returns Una lista de todos los productos.
   */
  async findAll(): Promise<ProductDocument[]> {
    return this.productModel.find().exec();
  }

  /**
   * Crea un nuevo producto.
   * @param productData Datos del producto a crear.
   * @returns El producto creado.
   */
  async create(
    productData: Omit<Product, 'status' | '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProductDocument> {
    const newProduct = new this.productModel(productData);
    return newProduct.save();
  }

  /**
   * Actualiza un producto existente.
   * @param id ID del producto a actualizar.
   * @param updateData Datos actualizados del producto.
   * @returns El producto actualizado o null si no se encuentra.
   */
  async update(id: string, updateData: any): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Elimina un producto de forma suave (soft delete).
   * @param id ID del producto a eliminar.
   * @returns El producto eliminado o null si no se encuentra.
   */
  async softDelete(id: string): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true },
    );
  }
}
