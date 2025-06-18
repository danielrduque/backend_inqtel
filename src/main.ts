// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // --- CONFIGURACIÓN DE CORS ---
  const allowedOrigins = [
    'http://localhost:4200', // Tu frontend de Angular en desarrollo
    'http://localhost:5173', // Si usas Vite (React/Vue) para otro frontend
    'https://inqtel.netlify.app', // Tu frontend de producción en Netlify
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido por CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // --- CONFIGURACIÓN DE SWAGGER ---
  const swaggerUser = process.env.SWAGGER_USER;
  const swaggerPassword = process.env.SWAGGER_PASSWORD;

  if (swaggerUser && swaggerPassword) {
    app.use(
      ['/docs', '/docs-json'],
      expressBasicAuth({
        challenge: true,
        users: { [swaggerUser]: swaggerPassword },
      }),
    );
  } else {
    console.warn(
      'ADVERTENCIA: Las variables de entorno SWAGGER_USER y SWAGGER_PASSWORD no están configuradas.',
    );
  }

  app.useStaticAssets(join(__dirname, '..', 'public'));

  const config = new DocumentBuilder()
    .setTitle('API INQTEL')
    .setDescription('Documentación de la API de INQTEL')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // --- LÓGICA DE ARRANQUE CORREGIDA ---
  // Si NO estamos en producción (ej. `npm run start:dev`)
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000; // Puerto 3000 para local
    await app.listen(port);
    console.log(`🚀 Servidor local corriendo en http://localhost:${port}`);
    console.log(`📖 Documentación disponible en http://localhost:${port}/docs`);
  } else {
    // Si estamos en producción (Vercel), preparamos la app y la retornamos
    await app.init();
    return app.getHttpAdapter().getInstance();
  }
}

export default bootstrap();
