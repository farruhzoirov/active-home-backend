import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty()
  @IsString()
  idToken: string;
}

export class TelegramAuthDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  first_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  last_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  username: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  photo_url: string;

  @ApiProperty()
  @IsString()
  hash: string;
}
