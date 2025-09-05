import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthDto, TelegramAuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() googleAuthDto: GoogleAuthDto) {
    const token =
      await this.authService.registerOrLoginWithGoogle(googleAuthDto);

    return {
      token,
      message: 'Authorized successfully',
      status: true,
    };
  }

  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  async telegramLogin(@Body() telegramAuthDto: TelegramAuthDto) {
    const token =
      await this.authService.registerOrLoginWithTelegram(telegramAuthDto);

    return {
      token,
      message: 'Authorized successfully',
      status: true,
    };
  }

  // @Post('register')
  // @HttpCode(HttpStatus.CREATED)
  // async register(
  //   @Body() authDto: LocalAuthDto & { firstName?: string; lastName?: string },
  // ) {
  //   return this.authService.register(authDto);
  // }
}
