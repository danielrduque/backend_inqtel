// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar CORS para todos los orígenes
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Configurar Swagger
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const config = new DocumentBuilder()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .setTitle('API')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .setDescription('Documentación de la API')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .setVersion('1.0')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .addBearerAuth() // Soporte para JWT
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .build();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const document = SwaggerModule.createDocument(app, config);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  SwaggerModule.setup('docs', app, document); // http://localhost:3000/docs

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
