import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ProductsModule, CloudinaryModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
