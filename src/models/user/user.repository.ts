import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { BaseRepository } from '../base.repository';
import { User } from './user.model';

/**
 * 用户实体
 */
export type UserEntity = DocumentType<User>;
/**
 * 用户模型
 */
export type UserModel = ReturnModelType<typeof User>;
/**
 * 用户模型名称
 */
export const userModelName = User.modelName;

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(userModelName) private readonly _userModel: UserModel,
  ) {
    super(_userModel);
  }

  /*
   * 根据邮箱，查找用户
   * @param {String} email 邮箱地址
   * @param {Boolean} pass 启用密码
   * @return {Promise[user]} 承载用户的 Promise 对象
   */
  async getUserByMail(email: string, pass: boolean) {
    let projection = null;
    if (pass) {
      projection = '+pass';
    }
    return super.findOne({ email }, projection);
  }

  /*
   * 根据登录名查找用户
   * @param {String} loginName 登录名
   * @param {Boolean} pass 启用密码
   * @return {Promise[user]} 承载用户的 Promise 对象
   */
  async getUserByLoginName(loginName: string, pass: boolean) {
    const query = { loginname: new RegExp('^' + loginName + '$', 'i') };
    let projection = null;
    if (pass) {
      projection = '+pass';
    }
    return super.findOne(query as any, projection);
  }

  /*
   * 根据 githubId 查找用户
   * @param {String} githubId 登录名
   * @return {Promise[user]} 承载用户的 Promise 对象
   */
  async getUserByGithubId(githubId: string) {
    const query = { githubId };
    return super.findOne(query);
  }

  /**
   * 更新收藏主题数
   */
  incrementCollectTopicCount(id: string) {
    return super.increment(id, 'collect_topic_count');
  }

  incrementScoreAndReplyCount(id: string, score: number, reply_count: number) {
    return this._userModel
      .findByIdAndUpdate(id, { $inc: { score, reply_count } })
      .exec();
  }
}
