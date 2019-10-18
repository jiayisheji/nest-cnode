import { Injectable } from '@nestjs/common';
import { BaseService } from '../base.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.interface';

@Injectable()
export class UserDbService extends BaseService<User> {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
    ) {
        super(userModel);
    }

    async create(docs: any): Promise<User> {
        docs.name = docs.loginname;
        const user = await super.create(docs);
        return user.save();
    }

    /*
    * 根据邮箱，查找用户
    * @param {String} email 邮箱地址
    * @return {Promise[user]} 承载用户的 Promise 对象
    */
    async getUserByMail(email: string): Promise<User> {
        return this.findOne({ email });
    }

    /*
    * 根据登录名查找用户
    * @param {String} loginName 登录名
    * @return {Promise[user]} 承载用户的 Promise 对象
    */
    async getUserByLoginName(loginName: string): Promise<User> {
        const query = { loginname: new RegExp('^' + loginName + '$', 'i') };
        return this.findOne(query);
    }

    /*
    * 根据 githubId 查找用户
    * @param {String} githubId 登录名
    * @return {Promise[user]} 承载用户的 Promise 对象
    */
    async getUserByGithubId(githubId: string): Promise<User> {
        const query = { githubId };
        return this.findOne(query);
    }
}
