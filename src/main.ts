import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { Http2gRPCExceptionFilter } from './shared-modules/filters/http-exception-filter';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: process.env.MS_URL!,
        package: process.env.MS_PROTO_PACKAGE!,
        protoPath: join(__dirname, 'modules', "user-manager", 'protos', 'User.proto'),
      }
    }
  );
  //class validator
 /* app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }
  ));
  app.useGlobalFilters(new Http2gRPCExceptionFilter())*/

  await app.listen();
}
bootstrap();
