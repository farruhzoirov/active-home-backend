import { Injectable, Logger } from '@nestjs/common';
import { GoogleAuthDto, TelegramAuthDto } from './dto/auth.dto';
import { GoogleLoginUseCase } from './use-cases/google-login.use-case';
import { TelegramLoginUseCase } from './use-cases/telegram-login.use-case';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly googleLoginUseCase: GoogleLoginUseCase,
    private readonly telegramLoginUseCase: TelegramLoginUseCase,
  ) {}

  async registerOrLoginWithGoogle(dto: GoogleAuthDto): Promise<string> {
    try {
      return await this.googleLoginUseCase.execute(dto);
    } catch (err) {
      this.logger.error(`Google auth error: ${err.message}`);
      throw err;
    }
  }

  async registerOrLoginWithTelegram(dto: TelegramAuthDto): Promise<string> {
    try {
      return await this.telegramLoginUseCase.execute(dto);
    } catch (err) {
      this.logger.error(`Telegram auth error: ${err.message}`);
      throw err;
    }
  }
}
