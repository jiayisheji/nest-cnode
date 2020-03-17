import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from './user.repository';
import { User } from './user.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.modelName, schema: User.schema }]),
    ],
    providers: [UserRepository],
    exports: [UserRepository],
})
export class UserModelModule { }