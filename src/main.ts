// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar CORS para todos los orígenes
  app.enableCors();

  // CORRECCIÓN 2: Validar las variables de entorno antes de usarlas
  const swaggerUser = process.env.SWAGGER_USER;
  const swaggerPassword = process.env.SWAGGER_PASSWORD;

  if (!swaggerUser || !swaggerPassword) {
    throw new Error(
      'Las variables de entorno SWAGGER_USER y SWAGGER_PASSWORD son obligatorias.',
    );
  }

  // Middleware de Autenticación para Swagger
  app.use(
    ['/docs', '/docs-json'],
    expressBasicAuth({
      challenge: true,
      users: {
        [swaggerUser]: swaggerPassword,
      },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('Documentación de la API')
    .setVersion('1.0')
    .addBearerAuth() // Soporte para JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // http://localhost:3000/docs

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
