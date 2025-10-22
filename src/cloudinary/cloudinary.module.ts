import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { CloudinaryService } from './cloudinary.service';

/**
 * Módulo de Cloudinary para la gestión de servicios relacionados con Cloudinary.
 */
@Module({
  imports: [ConfigModule], 
  providers: [CloudinaryService],
  exports: [CloudinaryService], 
})
export class CloudinaryModule {}