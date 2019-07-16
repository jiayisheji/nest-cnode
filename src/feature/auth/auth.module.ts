import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SharedModule } from '../../shared';
import { LocalStrategy } from './passport/local.strategy';

import { AuthSerializer } from './passport/auth.serializer';
import { GithubStrategy } from './passport/github.strategy';

@Module({
  imports: [SharedModule],
  providers: [
    AuthService,
    AuthSerializer,
    LocalStrategy,
    GithubStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule { }
