import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UserManagerModule } from './modules/user-manager/user-manager.module';

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
    //my modules
    UserManagerModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
