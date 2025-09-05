import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { PrismaService } from '../../database/src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthDto, TelegramAuthDto } from './dto/auth.dto';
import { JwtHelper } from 'libs/helpers/jwt.helper';
import { AuthProvider } from '@prisma/client';
import { BotService } from '@app/bot';

@Injectable()
export class AuthService {
  public client = new OAuth2Client();
  public logger = new Logger(AuthService.name);
  constructor(
    private readonly configService: ConfigService,
    private prisma: PrismaService,
    private botService: BotService,
    private jwtHelper: JwtHelper,
  ) {
    if (!configService.get('AUTH').GOOGLE_CLIENT_ID) {
      this.logger.error('GOOGLE_CLIENT_ID not found ');
    }
  }

  async verifyGoogleAuthToken(
    token: string,
  ): Promise<TokenPayload | undefined> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.configService.get('AUTH').GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload();
    } catch (err) {
      this.logger.error('Error during verifyingGoogleAuthToken');
      throw new UnauthorizedException('Invalid signature');
    }
  }

  async checkTelegramAuthHash(telegramAuthDto: TelegramAuthDto) {
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

  async registerOrLoginWithGoogle(
    googleAuthDto: GoogleAuthDto,
  ): Promise<string> {
    try {
      const payload = await this.verifyGoogleAuthToken(googleAuthDto.idToken);

      if (!payload) throw new UnauthorizedException('Invalid IdToken');

      const isUserExist = await this.prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!isUserExist) {
        const newUser = await this.prisma.user.create({
          data: {
            firstName: payload.given_name,
            lastName: payload.family_name,
            email: payload.email,
            image: payload.picture,
            authProvider: AuthProvider.GOOGLE,
          },
        });

        const token = await this.jwtHelper.generateJwtToken(newUser);
        return token;
      }
      const updateExistingUser = await this.prisma.user.update({
        where: { email: payload.email },
        data: {
          firstName: payload.given_name,
          lastName: payload.family_name,
          email: payload.email,
          image: payload.picture,
        },
      });
      const token = await this.jwtHelper.generateJwtToken(updateExistingUser);
      return token;
    } catch (err) {
      this.logger.error(`Auth error ${err.message}`);
      throw new UnauthorizedException('Error during authentication');
    }
  }

  async registerOrLoginWithTelegram(telegramAuthDto: TelegramAuthDto) {
    try {
      const isValidAuthHash = this.checkTelegramAuthHash(telegramAuthDto);

      if (!isValidAuthHash) {
        throw new UnauthorizedException('Invalid hash');
      }
      const isUserExist = await this.prisma.user.findFirst({
        where: {
          telegramId: telegramAuthDto.id,
        },
      });

      if (!isUserExist) {
        const newUser = await this.prisma.user.create({
          data: {
            telegramId: telegramAuthDto.id,
            firstName: telegramAuthDto?.first_name,
            lastName: telegramAuthDto?.last_name,
            telegramUserName: telegramAuthDto?.username,
            image: telegramAuthDto?.photo_url,
          },
        });
        this.botService.askingPhoneNumber(telegramAuthDto.id);
        return this.jwtHelper.generateJwtToken(newUser);
      }

      return this.jwtHelper.generateJwtToken(isUserExist);
    } catch (err) {
      this.logger.error('Error with telegram auth', err);
      throw new UnauthorizedException('Error with telegram auth');
    }
  }
}
