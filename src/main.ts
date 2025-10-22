import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

/**
 * Función principal para arrancar el microservicio gRPC de productos.
 */
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'products',
        protoPath: join(__dirname, 'proto/products.proto'),
        url: '0.0.0.0:50051',
      },
    },
  );

  await app.listen();
  console.log('Products Service se está ejecutando en el puerto 50051');
}
// Inicia la aplicación
bootstrap();
