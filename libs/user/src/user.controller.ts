import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto, UserResponseDto } from './dto/user.dto';
import { Role, Gender } from '@prisma/client';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<{
    data: UserResponseDto;
    message: string;
    status: boolean;
  }> {
    const user = await this.userService.create(createUserDto);
    return {
      data: user,
      message: 'User created successfully',
      status: true,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'gender', required: false, enum: Gender })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query() query: UserQueryDto): Promise<{
    data: {
      users: UserResponseDto[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    message: string;
    status: boolean;
  }> {
    const result = await this.userService.findAll(query);
    return {
      data: result,
      message: 'Users retrieved successfully',
      status: true,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<{
    data: UserResponseDto;
    message: string;
    status: boolean;
  }> {
    const user = await this.userService.findById(id);
    return {
      data: user,
      message: 'User found successfully',
      status: true,
    };
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByEmail(@Param('email') email: string): Promise<{
    data: UserResponseDto;
    message: string;
    status: boolean;
  }> {
    const user = await this.userService.findByEmail(email);
    return {
      data: user,
      message: 'User found successfully',
      status: true,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already taken' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{
    data: UserResponseDto;
    message: string;
    status: boolean;
  }> {
    const user = await this.userService.update(id, updateUserDto);
    return {
      data: user,
      message: 'User updated successfully',
      status: true,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<{
    data: UserResponseDto;
    message: string;
    status: boolean;
  }> {
    const user = await this.userService.softDelete(id);
    return {
      data: user,
      message: 'User deleted successfully',
      status: true,
    };
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently delete user by ID' })
  @ApiResponse({ status: 204, description: 'User permanently deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.hardDelete(id);
  }
}