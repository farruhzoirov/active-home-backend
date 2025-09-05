import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthProvider } from '@prisma/client';
import { PrismaService } from '../../database/src/prisma.service';
import { JwtHelper } from 'libs/helpers/jwt.helper';
import { GoogleAuthDto } from '../dto/auth.dto';
import { GoogleAuthProvider } from '../providers/google-auth.provider';

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    private readonly googleAuthProvider: GoogleAuthProvider,
    private readonly prisma: PrismaService,
    private readonly jwtHelper: JwtHelper,
  ) {}

  async execute(dto: GoogleAuthDto): Promise<string> {
    // 1. Verify Google token
    const payload = await this.googleAuthProvider.verifyToken(dto.idToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid IdToken');
    }

    // 2. Extract user data
    const userData = this.googleAuthProvider.extractUserData(payload);

    // 3. Find or create user
    const user = await this.findOrCreateUser(userData);

    // 4. Generate JWT token
    return this.jwtHelper.generateJwtToken(user);
  }

  private async findOrCreateUser(userData: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      return this.prisma.user.update({
        where: { email: userData.email },
        data: userData,
      });
    }

    return this.prisma.user.create({
      data: {
        ...userData,
        authProvider: AuthProvider.GOOGLE,
      },
    });
  }
}