import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Configuration } from './config';

@Module({
  imports: [
    MongooseModule.forRoot(Configuration.get('mongodb_url'), { useNewUrlParser: true }),
  ],
  controllers: [AppController],
  providers: [ AppService ],
})
export class AppModule {}
