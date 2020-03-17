import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.model';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import { BaseRepository } from '../base.repository';

/**
 * 用户实体
 */
export type UserEntity = User;
/**
 * 用户模型
 */
export type UserModel = ReturnModelType<typeof User>;
/**
 * 用户模型名称
 */
export const userModelName = User.modelName;

@Injectable()
export class UserRepository extends BaseRepository<User>{
    constructor(@InjectModel(userModelName) private readonly _userModel: UserModel) {
        super(_userModel);
    }

    async create(docs: Partial<User>): Promise<DocumentType<User>> {
        docs.name = docs.loginname;
        const user = await super.create(docs);
        return user.save();
    }

    /*
    * 根据邮箱，查找用户
    * @param {String} email 邮箱地址
    * @param {Boolean} pass 启用密码
    * @return {Promise[user]} 承载用户的 Promise 对象
    */
    async getUserByMail(email: string, pass: boolean): Promise<User> {
        let projection = null;
        if (pass) {
            projection = '+pass';
        }
        return super.findOneAsync({ email }, projection);
    }

    /*
    * 根据登录名查找用户
    * @param {String} loginName 登录名
    * @param {Boolean} pass 启用密码
    * @return {Promise[user]} 承载用户的 Promise 对象
    */
    async getUserByLoginName(loginName: string, pass: boolean): Promise<User> {
        const query = { loginname: new RegExp('^' + loginName + '$', 'i') };
        let projection = null;
        if (pass) {
            projection = '+pass';
        }
        return super.findOneAsync(query, projection);
    }

    /*
    * 根据 githubId 查找用户
    * @param {String} githubId 登录名
    * @return {Promise[user]} 承载用户的 Promise 对象
    */
    async getUserByGithubId(githubId: string): Promise<User> {
        const query = { githubId };
        return super.findOneAsync(query);
    }
}

