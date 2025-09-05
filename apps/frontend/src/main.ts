import { NestFactory } from '@nestjs/core';
import { FrontendModule } from './frontend.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(FrontendModule);

  app.enableCors({
    origin: '*',
    // 'https://linguabarno-payments.netlify.app',
    // 'https://dynamics-market.uz',
    // 'https://admin.dynamics-market.uz',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      'Content-Type, Authorization, Accept-Language, App-Type, Accept',
  });

  // app.use(
  //   ['/api-docs'],
  //   // basicAuth({
  //   //   challenge: true,
  //   //   users: { admin: process.env.SWAGGER_PASSWORD },
  //   // }),
  // );

  // Swagger-based
  const options = new DocumentBuilder()
    .setTitle('ACTIVE HOME UI APIS')
    .setDescription('ACTIVE HOME')
    .setVersion('1.0')
    .addServer(`http://localhost:3000`, 'Local environment')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
