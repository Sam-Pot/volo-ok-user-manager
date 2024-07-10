//RENAME THIS FILE WITH THE NAME OF YOUR MODULE
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/shared-modules/database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';

@Module({
    imports: [
        //CONFIG MODULE
        ConfigModule.forRoot({
            //load env parameters
            load: [() => ({

            })],
            validationSchema: Joi.object({

            })
        }),
        TypeOrmModule.forFeature([User]),
        DatabaseModule
    ],
    controllers: [UserController],
    providers: [UserService, UserRepository],
})
export class UserManagerModule { }
