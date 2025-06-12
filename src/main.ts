// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar CORS para permitir peticiones desde tu frontend de Angular
  // Es importante tenerlo para el desarrollo local.
  app.enableCors({
    origin: 'http://localhost:4200', // Origen de tu app Angular en desarrollo
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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
    console.warn(
      'ADVERTENCIA: Las variables de entorno SWAGGER_USER y SWAGGER_PASSWORD no están configuradas. La documentación /docs no estará protegida.',
    );
  }

  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('API INQTEL')
    .setDescription('Documentación de la API de INQTEL')
    .setVersion('1.0')
    .addBearerAuth() // Soporte para JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // --- LÓGICA CONDICIONAL PARA LOCAL VS VERCEL ---

  // Si NO estamos en producción (o sea, estamos en local)
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Servidor local corriendo en http://localhost:${port}`);
    console.log(`📖 Documentación disponible en http://localhost:${port}/docs`);
  } else {
    // Si estamos en producción (Vercel)
    await app.init();
    return app.getHttpAdapter().getInstance();
  }
}

// Para Vercel, exportamos el resultado de la función.
// Para local, la función misma se encarga de iniciar el servidor.
// Si no es producción, esto exportará `undefined`, lo cual está bien.
export default bootstrap();
