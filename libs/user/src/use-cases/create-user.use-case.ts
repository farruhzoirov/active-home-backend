import { Injectable, ConflictException } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserDto } from '../dto/user.dto';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.existsByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    // Create new user
    return await this.userRepository.create(dto);
  }
}