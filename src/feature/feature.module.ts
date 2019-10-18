import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TopicModule } from './topic/topic.module';

@Module({
  imports: [TopicModule, AuthModule],
  exports: [TopicModule, AuthModule],
})
export class FeatureModule { }
