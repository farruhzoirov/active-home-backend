import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async softDelete(id: number): Promise<User> {
    // Check if user exists
    const userExists = await this.userRepository.exists(id);
    if (!userExists) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Soft delete user
    return await this.userRepository.softDelete(id);
  }

  async hardDelete(id: number): Promise<void> {
    // Check if user exists
    const userExists = await this.userRepository.exists(id);
    if (!userExists) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Hard delete user (be careful with this!)
    await this.userRepository.hardDelete(id);
  }
}