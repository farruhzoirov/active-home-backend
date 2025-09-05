import { Module } from '@nestjs/common';
import { FrontendController } from './frontend.controller';
import { FrontendService } from './frontend.service';
import { DatabaseModule } from '@app/database';
import { ConfigModule } from '@nestjs/config';
import { configurations } from '@app/config';
import { AuthModule } from 'libs/auth/src';
import { BotModule } from '@app/bot';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: configurations,
    }),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [FrontendController],
  providers: [FrontendService],
})
export class FrontendModule {}
