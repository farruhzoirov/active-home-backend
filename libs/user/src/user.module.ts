import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseModule } from '../../database/src/database.module';

// Repository
import { UserRepository } from './repositories/user.repository';
import { IUserRepository } from './interfaces/user-repository.interface';

// Use Cases
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetUserUseCase } from './use-cases/get-user.use-case';
import { GetUsersUseCase } from './use-cases/get-users.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    UserService,
    
    // Repository
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    
    // Use Cases
    {
      provide: CreateUserUseCase,
      useFactory: (userRepo: IUserRepository) => new CreateUserUseCase(userRepo),
      inject: ['IUserRepository'],
    },
    {
      provide: GetUserUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserUseCase(userRepo),
      inject: ['IUserRepository'],
    },
    {
      provide: GetUsersUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUsersUseCase(userRepo),
      inject: ['IUserRepository'],
    },
    {
      provide: UpdateUserUseCase,
      useFactory: (userRepo: IUserRepository) => new UpdateUserUseCase(userRepo),
      inject: ['IUserRepository'],
    },
    {
      provide: DeleteUserUseCase,
      useFactory: (userRepo: IUserRepository) => new DeleteUserUseCase(userRepo),
      inject: ['IUserRepository'],
    },
  ],
  exports: [UserService, 'IUserRepository'],
})
export class UserModule {}