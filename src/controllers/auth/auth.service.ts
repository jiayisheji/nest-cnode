import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compareSync, hashSync } from 'bcryptjs';
import { Validator } from 'class-validator';
import { UserRepository } from 'src/models';
import { MailService } from 'src/shared/services/mail.services';
import { diffEncryptMD5, encryptMD5 } from 'src/shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { APP_CONFIG } from '../../core';
import { AccountDto, RegisterDto } from './dto';
import { GitHubProfile } from './passport/github.strategy';

// Validation methods
const validator = new Validator();

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name, true);
  private readonly secret: string = this.config.get('express.secret');
  constructor(
    private readonly userRepository: UserRepository,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /** 注册 */
  async register(register: RegisterDto) {
    const { loginname, email } = register;
    // 检查用户是否存在，查询登录名和邮箱
    const exist = await this.userRepository.count({
      $or: [{ loginname }, { email }],
    } as any);
    // 返回1存在，0不存在
    if (exist) {
      return {
        error: '用户名或邮箱已被使用。',
        loginname,
        email,
      };
    }
    // hash加密密码，不能明文存储到数据库
    const passhash = hashSync(register.pass, 10);
    // 保存用户到数据库
    try {
      await this.userRepository.save({
        loginname,
        email,
        pass: passhash,
        name: loginname,
        accessToken: uuidv4(),
      });

      const token = encryptMD5(email + passhash + this.secret);
      this.mailService.sendActiveMail(email, token, loginname);

      return {
        success: `欢迎加入 ${APP_CONFIG.name}！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /** 激活账户 */
  async activeAccount({ name, key }: AccountDto) {
    const user = await this.userRepository.findOne({
      loginname: name,
    });
    // 检查用户是否存在
    if (!user) {
      return { error: '用户不存在' };
    }
    // 对比key是否正确
    if (!user || !diffEncryptMD5(user.email + user.pass + this.secret, key)) {
      return { error: '信息有误，帐号无法被激活。' };
    }
    // 检查用户是否激活过
    if (user.active) {
      return { error: '帐号已经是激活状态。', referer: '/login' };
    }

    // 如果没有激活，就激活操作
    user.active = true;
    await user.save();
    return { success: '帐号已被激活，请登录', referer: '/login' };
  }

  /** 本地登录 */
  async local(username = '', password = '') {
    // 处理用户名和密码前后空格，用户名全部小写 保证和注册一致
    username = username.trim().toLowerCase();
    password = password.trim();
    // 验证用户名
    // 可以用户名登录 /^[a-zA-Z0-9\-_]\w{4,20}$/
    // 可以邮箱登录 标准邮箱格式
    // 做一个验证用户名适配器
    const verifyUsername = (name: string) => {
      // 如果输入账号里面有@，表示是邮箱
      if (name.indexOf('@') > 0) {
        return validator.isEmail(name);
      }
      return validator.matches(name, /^[a-zA-Z0-9\-_]\w{4,20}$/);
    };
    if (!verifyUsername(username)) {
      throw new UnauthorizedException('用户名格式不正确。');
    }
    // 验证密码 密码长度是6-18位
    if (!validator.isByteLength(password, 6, 18)) {
      throw new UnauthorizedException('密码长度不是6-18位。');
    }
    // 做一个获取用户适配器
    const getUser = (name: string) => {
      // 如果输入账号里面有@，表示是邮箱
      if (name.indexOf('@') > 0) {
        return this.userRepository.getUserByMail(name, true);
      }
      return this.userRepository.getUserByLoginName(name, true);
    };
    const user = await getUser(username);
    // 检查用户是否存在
    if (!user) {
      throw new UnauthorizedException('用户不存在。');
    }
    const equal = compareSync(password, user.pass);
    // 密码不匹配
    if (!equal) {
      throw new UnauthorizedException('用户密码不匹配。');
    }
    // 用户未激活
    if (!user.active) {
      // 发送激活邮件
      const token = encryptMD5(user.email + user.pass + this.secret);
      this.mailService.sendActiveMail(user.email, token, user.loginname);
      throw new UnauthorizedException(
        '此帐号还没有被激活，激活链接已发送到 ' +
          user.email +
          ' 邮箱，请查收。',
      );
    }
    // 验证通过
    return user;
  }

  /** github登录 */
  async github(profile: GitHubProfile) {
    if (!profile) {
      throw new UnauthorizedException('您 GitHub 账号的 认证失败');
    }
    // 获取用户的邮箱
    const email =
      profile.emails && profile.emails[0] && profile.emails[0].value;
    // 根据 githubId 查找用户
    let existUser = await this.userRepository.getUserByGithubId(profile.id);

    // 用户不存在则创建
    if (!existUser) {
      existUser = this.userRepository.create();
      existUser.githubId = profile.id;
      existUser.active = true;
      existUser.accessToken = profile.accessToken;
    }

    // 用户存在，更新字段
    existUser.loginname = profile.username;
    existUser.email = email || existUser.email;
    existUser.avatar = profile._json.avatar_url;
    existUser.githubUsername = profile.username;
    existUser.githubAccessToken = profile.accessToken;

    // 保存用户到数据库
    try {
      await this.userRepository.update(existUser.id, existUser);
      // 返回用户
      return existUser;
    } catch (error) {
      // 获取MongoError错误信息
      const { errmsg = '' } = error;
      // 处理邮箱和用户名重复问题
      if (errmsg.indexOf('duplicate key error') > -1) {
        if (errmsg.indexOf('email') > -1) {
          throw new UnauthorizedException(
            '您 GitHub 账号的 Email 与之前在 CNodejs 注册的 Email 重复了',
          );
        }

        if (errmsg.indexOf('loginname') > -1) {
          throw new UnauthorizedException(
            '您 GitHub 账号的用户名与之前在 CNodejs 注册的用户名重复了',
          );
        }
      }
      throw new InternalServerErrorException(error);
    }
  }
}
