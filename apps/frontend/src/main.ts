import { NestFactory } from '@nestjs/core';
import { FrontendModule } from './frontend.module';

async function bootstrap() {
  const app = await NestFactory.create(FrontendModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
