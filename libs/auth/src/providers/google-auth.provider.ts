import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { GoogleAuthDto } from '../dto/auth.dto';

@Injectable()
export class GoogleAuthProvider {
  private readonly client = new OAuth2Client();
  private readonly logger = new Logger(GoogleAuthProvider.name);

  constructor(private readonly configService: ConfigService) {
    if (!configService.get('AUTH').GOOGLE_CLIENT_ID) {
      this.logger.error('GOOGLE_CLIENT_ID not found');
    }
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
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

  extractUserData(payload: TokenPayload) {
    return {
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      image: payload.picture,
    };
  }
}