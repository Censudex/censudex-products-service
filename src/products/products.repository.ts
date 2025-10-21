import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findByName(name: string): Promise<ProductDocument | null> {
    return this.productModel.findOne({ name }).exec();
  }

  async findById(id: string): Promise<ProductDocument | null> {
    return this.productModel.findById(id).exec();
  }

  async findAll(): Promise<ProductDocument[]> {
    return this.productModel.find().exec();
  }

  async create(
    productData: Omit<Product, 'status' | '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProductDocument> {
    const newProduct = new this.productModel(productData);
    return newProduct.save();
  }

  async update(id: string, updateData: any): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async softDelete(id: string): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true },
    );
  }
}
