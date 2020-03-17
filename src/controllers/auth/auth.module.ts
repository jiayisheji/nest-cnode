import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './passport/local.strategy';

import { AuthSerializer } from './passport/auth.serializer';
import { GithubStrategy } from './passport/github.strategy';
import { UserModelModule } from 'src/models';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    SharedModule,
    UserModelModule
  ],
  providers: [
    AuthService,
    AuthSerializer,
    LocalStrategy,
    GithubStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule { }
