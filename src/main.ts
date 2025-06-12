// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // --- CONFIGURACIÓN DE CORS MEJORADA ---

  // 1. Define todos los orígenes que tienen permiso para conectarse.
  const allowedOrigins = [
    'http://localhost:4200', // Tu frontend de Angular en desarrollo
    'http://localhost:5173', // Si usas Vite (React/Vue) para otro frontend
    'https://inqtel.netlify.app', // Tu frontend de producción en Netlify
  ];

  // 2. Habilita CORS con una configuración más flexible.
  app.enableCors({
    origin: (origin, callback) => {
      // Permite peticiones sin 'origin' (como las de Postman o apps móviles)
      // o si el origen está en nuestra lista de permitidos.
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido por CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // El resto de tu código se mantiene igual...

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

  // La lógica para Vercel vs Local es correcta y se mantiene
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3001; // Usualmente el backend corre en un puerto diferente al frontend
    await app.listen(port);
    console.log(`🚀 Servidor local corriendo en http://localhost:${port}`);
    console.log(`📖 Documentación disponible en http://localhost:${port}/docs`);
  } else {
    await app.init();
    // No devuelvas la instancia aquí si vas a usar `export default bootstrap()`
  }
}

// Para Vercel, la exportación debe estar fuera de la función.
// El `else` de arriba ya se encarga de no llamar a listen().
export default bootstrap();
