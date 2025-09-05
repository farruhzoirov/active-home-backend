import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtHelper {
  private readonly jwtSecretKey: string;
  public logger = new Logger(JwtHelper.name);
  constructor(private configService: ConfigService) {
    this.jwtSecretKey = this.configService.get('AUTH').JWT_SECRET_KEY;

    if (!this.jwtSecretKey) {
      this.logger.error('JWT_SECRET_KEY not found ');
    }
  }
  async generateJwtToken(payload: User): Promise<string> {
    const { role, telegramId, ...rest } = payload;

    return jwt.sign(
      { telegramId: telegramId?.toString(), ...rest },
      this.jwtSecretKey,
      {
        expiresIn: '7d',
      },
    );
  }

  async verifyAndDecodeJwtToken(token: string) {
    return jwt.verify(token, this.jwtSecretKey);
  }
}
