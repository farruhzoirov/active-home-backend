import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../../database/src/database.module';
import { JwtHelper } from 'libs/helpers/jwt.helper';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, JwtHelper],
  exports: [AuthService],
})
export class AuthModule {}
