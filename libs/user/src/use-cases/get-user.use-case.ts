import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }
}