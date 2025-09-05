import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/src/prisma.service';
import { JwtHelper } from 'libs/helpers/jwt.helper';
import { BotService } from '@app/bot';
import { TelegramAuthDto } from '../dto/auth.dto';
import { TelegramAuthProvider } from '../providers/telegram-auth.provider';

@Injectable()
export class TelegramLoginUseCase {
  constructor(
    private readonly telegramAuthProvider: TelegramAuthProvider,
    private readonly prisma: PrismaService,
    private readonly jwtHelper: JwtHelper,
    private readonly botService: BotService,
  ) {}

  async execute(dto: TelegramAuthDto): Promise<string> {
    // 1. Verify Telegram hash
    const isValidHash = await this.telegramAuthProvider.verifyHash(dto);
    if (!isValidHash) {
      throw new UnauthorizedException('Invalid hash');
    }

    // 2. Extract user data
    const userData = this.telegramAuthProvider.extractUserData(dto);

    // 3. Find or create user
    const user = await this.findOrCreateUser(userData, dto.telegramId);

    // 4. Handle phone number request
    if (!user.phone) {
      await this.botService.requestPhoneNumber(dto.telegramId);
    }

    // 5. Generate JWT token
    return this.jwtHelper.generateJwtToken(user);
  }

  private async findOrCreateUser(userData: any, telegramId: number) {
    const existingUser = await this.prisma.user.findFirst({
      where: { telegramId },
    });

    if (existingUser) {
      return existingUser;
    }

    const newUser = await this.prisma.user.create({
      data: userData,
    });

    await this.botService.requestPhoneNumber(telegramId);
    return newUser;
  }
}