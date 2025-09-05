import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { TelegramAuthDto } from '../dto/auth.dto';

@Injectable()
export class TelegramAuthProvider {
  private readonly logger = new Logger(TelegramAuthProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async verifyHash(telegramAuthDto: TelegramAuthDto): Promise<boolean> {
    const { hash, ...userData } = telegramAuthDto;
    
    const secret = crypto
      .createHash('sha256')
      .update(this.configService.get('AUTH').TELEGRAM_BOT_TOKEN)
      .digest();

    const checkString = Object.keys(userData)
      .sort()
      .map((key) => `${key}=${userData[key]}`)
      .join('\n');

    const hmac = crypto
      .createHmac('sha256', secret)
      .update(checkString)
      .digest('hex');

    return hmac === hash;
  }

  extractUserData(dto: TelegramAuthDto) {
    return {
      telegramId: dto.telegramId,
      firstName: dto.first_name,
      lastName: dto.last_name,
      telegramUserName: dto.username,
      image: dto.photo_url,
    };
  }
}