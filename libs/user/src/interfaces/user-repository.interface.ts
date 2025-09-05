import { User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dto/user.dto';

export interface IUserRepository {
  // Create
  create(data: CreateUserDto): Promise<User>;

  // Read
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByTelegramId(telegramId: bigint): Promise<User | null>;
  findAll(query: UserQueryDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }>;

  // Update
  update(id: number, data: UpdateUserDto): Promise<User>;

  // Delete
  softDelete(id: number): Promise<User>;
  hardDelete(id: number): Promise<void>;

  // Utility methods
  exists(id: number): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  count(): Promise<number>;
}