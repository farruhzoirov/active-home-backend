import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../../database/src/prisma.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dto/user.dto';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id, isDeleted: false },
      });
    } catch (error) {
      this.logger.error(`Error finding user by id ${id}: ${error.message}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email, isDeleted: false },
      });
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`);
      throw error;
    }
  }

  async findByTelegramId(telegramId: bigint): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { telegramId, isDeleted: false },
      });
    } catch (error) {
      this.logger.error(`Error finding user by telegram id: ${error.message}`);
      throw error;
    }
  }

  async findAll(query: UserQueryDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { search, role, gender, page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      const where: any = { isDeleted: false };

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (role) where.role = role;
      if (gender) where.gender = gender;

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ]);

      return { users, total, page, limit };
    } catch (error) {
      this.logger.error(`Error finding users: ${error.message}`);
      throw error;
    }
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id, isDeleted: false },
        data,
      });
    } catch (error) {
      this.logger.error(`Error updating user ${id}: ${error.message}`);
      throw error;
    }
  }

  async softDelete(id: number): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { isDeleted: true },
      });
    } catch (error) {
      this.logger.error(`Error soft deleting user ${id}: ${error.message}`);
      throw error;
    }
  }

  async hardDelete(id: number): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Error hard deleting user ${id}: ${error.message}`);
      throw error;
    }
  }

  async exists(id: number): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id, isDeleted: false },
        select: { id: true },
      });
      return !!user;
    } catch (error) {
      this.logger.error(`Error checking user existence ${id}: ${error.message}`);
      return false;
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email, isDeleted: false },
        select: { id: true },
      });
      return !!user;
    } catch (error) {
      this.logger.error(`Error checking user email existence: ${error.message}`);
      return false;
    }
  }

  async count(): Promise<number> {
    try {
      return await this.prisma.user.count({
        where: { isDeleted: false },
      });
    } catch (error) {
      this.logger.error(`Error counting users: ${error.message}`);
      return 0;
    }
  }
}