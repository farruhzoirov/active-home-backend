import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { PrismaService } from '../../database/src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthDto } from './dto/auth.dto';
import { JwtHelper } from 'libs/helpers/jwt.helper';

@Injectable()
export class AuthService {
  public client = new OAuth2Client();
  public logger = new Logger(AuthService.name);
  constructor(
    private readonly configService: ConfigService,
    private prisma: PrismaService,
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
}
