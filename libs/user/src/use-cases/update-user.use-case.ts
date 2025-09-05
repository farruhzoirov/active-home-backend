import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UpdateUserDto } from '../dto/user.dto';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number, dto: UpdateUserDto): Promise<User> {
    // Check if user exists
    const userExists = await this.userRepository.exists(id);
    if (!userExists) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // If email is being updated, check if it's already taken
    if (dto.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(`Email ${dto.email} is already taken`);
      }
    }

    // Update user
    return await this.userRepository.update(id, dto);
  }
}