import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserQueryDto } from '../dto/user.dto';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class GetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(query: UserQueryDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.userRepository.findAll(query);
    
    const totalPages = Math.ceil(result.total / result.limit);

    return {
      ...result,
      totalPages,
    };
  }
}