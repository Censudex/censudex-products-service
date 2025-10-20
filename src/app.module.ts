import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose'; 
import { ProductsModule } from './products/products.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    // Carga las variables de entorno desde el archivo .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configura la conexión a MongoDB usando la variable de entorno MONGO_URI
    MongooseModule.forRootAsync({
      imports: [ConfigModule], 
      inject: [ConfigService], 
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    // Módulo de Productos
    ProductsModule,
    // Módulo de Cloudinary
    CloudinaryModule,
  ],
})
export class AppModule {}
