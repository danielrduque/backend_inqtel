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

  // Validar las variables de entorno para Swagger
  const swaggerUser = process.env.SWAGGER_USER;
  const swaggerPassword = process.env.SWAGGER_PASSWORD;

  // Se protege la documentación de Swagger solo si las credenciales existen
  if (swaggerUser && swaggerPassword) {
    app.use(
      ['/docs', '/docs-json'],
      expressBasicAuth({
        challenge: true,
        users: {
          [swaggerUser]: swaggerPassword,
        },
      }),
    );
  } else {
    // Es una buena práctica advertir si las variables no están definidas en lugar de lanzar un error
    console.warn(
      'ADVERTENCIA: Las variables de entorno SWAGGER_USER y SWAGGER_PASSWORD no están configuradas. La documentación /docs no estará protegida.',
    );
  }

  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('Documentación de la API')
    .setVersion('1.0')
    .addBearerAuth() // Soporte para JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // *** CAMBIOS CLAVE PARA VERCEL ***
  // 1. Inicializar la aplicación pero sin ponerla a escuchar en un puerto.
  await app.init();
  // 2. Obtener la instancia del servidor Express subyacente.
  const expressApp = app.getHttpAdapter().getInstance();
  // 3. Devolver el manejador de Express.
  return expressApp;
}

// 4. Exportar la promesa que resuelve al manejador para que Vercel la use.
export default bootstrap();
