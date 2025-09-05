import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../../database/src/database.module';
import { JwtHelper } from 'libs/helpers/jwt.helper';
import { BotModule } from '@app/bot';

// Providers
import { GoogleAuthProvider } from './providers/google-auth.provider';
import { TelegramAuthProvider } from './providers/telegram-auth.provider';

// Use Cases
import { GoogleLoginUseCase } from './use-cases/google-login.use-case';
import { TelegramLoginUseCase } from './use-cases/telegram-login.use-case';

@Module({
  imports: [DatabaseModule, BotModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtHelper,
    // Providers
    GoogleAuthProvider,
    TelegramAuthProvider,
    // Use Cases
    GoogleLoginUseCase,
    TelegramLoginUseCase,
  ],
  exports: [AuthService],
})
export class AuthModule {}
