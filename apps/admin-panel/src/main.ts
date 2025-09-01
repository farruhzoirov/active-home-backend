import { NestFactory } from '@nestjs/core';
import { AdminPanelModule } from './admin-panel.module';

async function bootstrap() {
  const app = await NestFactory.create(AdminPanelModule);
  await app.listen(process.env.port ?? 4000);
}
bootstrap();
