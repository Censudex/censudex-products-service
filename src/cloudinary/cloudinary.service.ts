import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
/**
 * Servicio para manejar la integración con Cloudinary.
 */
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Sube un buffer de imagen a Cloudinary
   * @param imageBuffer El buffer de la imagen (bytes)
   * @returns La URL segura de la imagen subida
   */
  async uploadImage(imageBuffer: Buffer): Promise<string> {
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'censudex-products', 
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            return reject(error);
          }
          resolve(result.secure_url); 
        },
      );
      uploadStream.end(imageBuffer);
    });
  }
}