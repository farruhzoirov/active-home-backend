import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../database/src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthDto } from './dto/auth.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  public client = new OAuth2Client();
  public logger = new Logger(AuthService.name);
  constructor(
    private readonly configService: ConfigService,
    private prisma: PrismaService,
  ) {
    if (!configService.get('AUTH').GOOGLE_CLIENT_ID) {
      this.logger.error('GOOGLE_CLIENT_ID not found ');
    }

    if (!configService.get('AUTH').JWT_SECRET_KEY) {
      this.logger.error('JWT_SECRET_KEY not found ');
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

  async generateJwtToken(payload: User): Promise<string> {
    const jwtSecretKey = this.configService.get('AUTH').JWT_SECRET_KEY;
    const { role, ...rest } = payload;
    return jwt.sign(rest, jwtSecretKey, {
      expiresIn: '7d',
    });
  }

  async registerOrLoginWithGoogle(
    googleAuthDto: GoogleAuthDto,
  ): Promise<string> {
    try {
      const payload = await this.verifyGoogleAuthToken(googleAuthDto.idToken);

      if (!payload) throw new UnauthorizedException('Invalid IdToken');
      const isUserExist = await this.prisma.user.findFirst({
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
          },
        });

        const token = await this.generateJwtToken(newUser);
        return token;
      }
      const token = await this.generateJwtToken(isUserExist);
      return token;
    } catch (err) {
      this.logger.error(`Auth error ${err.message}`);
      throw new UnauthorizedException('Error during authentication');
    }
  }
}
