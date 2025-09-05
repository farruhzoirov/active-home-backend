import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto, UserQueryDto, UserResponseDto } from './dto/user.dto';

// Use Cases
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetUserUseCase } from './use-cases/get-user.use-case';
import { GetUsersUseCase } from './use-cases/get-users.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.createUserUseCase.execute(dto);
      return this.toResponseDto(user);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  async findById(id: number): Promise<UserResponseDto> {
    try {
      const user = await this.getUserUseCase.execute(id);
      return this.toResponseDto(user);
    } catch (error) {
      this.logger.error(`Error finding user by id ${id}: ${error.message}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    try {
      const user = await this.getUserUseCase.getByEmail(email);
      return this.toResponseDto(user);
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`);
      throw error;
    }
  }

  async findAll(query: UserQueryDto): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const result = await this.getUsersUseCase.execute(query);
      
      return {
        ...result,
        users: result.users.map(user => this.toResponseDto(user)),
      };
    } catch (error) {
      this.logger.error(`Error finding users: ${error.message}`);
      throw error;
    }
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.updateUserUseCase.execute(id, dto);
      return this.toResponseDto(user);
    } catch (error) {
      this.logger.error(`Error updating user ${id}: ${error.message}`);
      throw error;
    }
  }

  async softDelete(id: number): Promise<UserResponseDto> {
    try {
      const user = await this.deleteUserUseCase.softDelete(id);
      return this.toResponseDto(user);
    } catch (error) {
      this.logger.error(`Error soft deleting user ${id}: ${error.message}`);
      throw error;
    }
  }

  async hardDelete(id: number): Promise<void> {
    try {
      await this.deleteUserUseCase.hardDelete(id);
    } catch (error) {
      this.logger.error(`Error hard deleting user ${id}: ${error.message}`);
      throw error;
    }
  }

  // Helper method to convert User to UserResponseDto
  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: user.image,
      role: user.role,
      gender: user.gender,
      phone: user.phone,
      address: user.address,
      country: user.country,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}