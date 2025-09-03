import { NestFactory } from '@nestjs/core';
import { FrontendModule } from './frontend.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(FrontendModule);

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
