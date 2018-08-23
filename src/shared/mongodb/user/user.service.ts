import { Injectable } from '@nestjs/common';
import { BaseService } from '../base.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.interface';

@Injectable()
export class UserService extends BaseService<User> {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
    ) {
        super();
        this._model = userModel;
    }
}
