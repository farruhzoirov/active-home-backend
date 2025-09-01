import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  AuthService,
  LocalAuthDto,
  GoogleAuthDto,
  TelegramAuthDto,
} from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/local')
  @HttpCode(HttpStatus.OK)
  async localLogin(@Body() authDto: LocalAuthDto) {
    return this.authService.localAuth(authDto);
  }

  @Post('login/google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() authDto: GoogleAuthDto) {
    return this.authService.googleAuth(authDto);
  }

  @Post('login/telegram')
  @HttpCode(HttpStatus.OK)
  async telegramLogin(@Body() authDto: TelegramAuthDto) {
    return this.authService.telegramAuth(authDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() authDto: LocalAuthDto & { firstName?: string; lastName?: string },
  ) {
    return this.authService.register(authDto);
  }
}
