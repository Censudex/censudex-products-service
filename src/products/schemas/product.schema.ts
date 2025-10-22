import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // Para generar UUID

export type ProductDocument = Product & Document;

/**
 * Esquema de Mongoose para la colección de productos.
 */
@Schema({ timestamps: true }) 
/**
 * Clase que representa un producto en la base de datos.
 */
export class Product {
  @Prop({ type: String, default: () => uuidv4() }) 
  _id: string;

  @Prop({ required: true, unique: true }) 
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  imageUrl: string; 

  @Prop({ default: 'active' }) 
  status: string; 

  @Prop()
  createdAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);