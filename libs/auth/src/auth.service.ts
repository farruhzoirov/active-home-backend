import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface LocalAuthDto {
  email: string;
  password: string;
}

export interface GoogleAuthDto {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string;
}

export interface TelegramAuthDto {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async localAuth(authDto: LocalAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: authDto.email },
    });

    if (!user || user.authProvider !== AuthProvider.LOCAL) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      authDto.password,
      user.password!,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateUserResponse(user);
  }

  async googleAuth(authDto: GoogleAuthDto) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: authDto.googleId }, { email: authDto.email }],
      },
    });

    if (user) {
      // Update existing user with Google info if needed
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: authDto.googleId,
            authProvider: AuthProvider.GOOGLE,
            emailVerified: true,
            emailVerifiedAt: new Date(),
            ...(authDto.firstName && { firstName: authDto.firstName }),
            ...(authDto.lastName && { lastName: authDto.lastName }),
            ...(authDto.image && { image: authDto.image }),
          },
        });
      }
    } else {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          googleId: authDto.googleId,
          email: authDto.email,
          authProvider: AuthProvider.GOOGLE,
          firstName: authDto.firstName,
          lastName: authDto.lastName,
          image: authDto.image,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
    }

    return this.generateUserResponse(user);
  }

  async telegramAuth(authDto: TelegramAuthDto) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { telegramId: authDto.telegramId },
          ...(authDto.username ? [{ username: authDto.username }] : []),
        ],
      },
    });

    if (user) {
      // Update existing user with Telegram info if needed
      if (!user.telegramId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            telegramId: authDto.telegramId,
            authProvider: AuthProvider.TELEGRAM,
            ...(authDto.username && { username: authDto.username }),
            ...(authDto.firstName && { firstName: authDto.firstName }),
            ...(authDto.lastName && { lastName: authDto.lastName }),
            ...(authDto.image && { image: authDto.image }),
          },
        });
      }
    } else {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          telegramId: authDto.telegramId,
          username: authDto.username,
          authProvider: AuthProvider.TELEGRAM,
          firstName: authDto.firstName,
          lastName: authDto.lastName,
          image: authDto.image,
        },
      });
    }

    return this.generateUserResponse(user);
  }

  async register(
    authDto: LocalAuthDto & { firstName?: string; lastName?: string },
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: authDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(authDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: authDto.email,
        password: hashedPassword,
        authProvider: AuthProvider.LOCAL,
        firstName: authDto.firstName,
        lastName: authDto.lastName,
      },
    });

    return this.generateUserResponse(user);
  }

  private generateUserResponse(user: any) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
