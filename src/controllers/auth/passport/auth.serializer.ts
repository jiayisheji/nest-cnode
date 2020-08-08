import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportSerializer } from '@nestjs/passport';
import { UserEntity } from 'src/models';

@Injectable()
export class AuthSerializer extends PassportSerializer {
  /**
   * 序列化用户信息后存储进 session
   * @param user
   * @param done
   */
  serializeUser(
    user: UserEntity,
    done: (error: Error, user: UserEntity) => void,
  ) {
    done(null, user);
  }

  /**
   * 反序列化后取出用户信息
   * @param payload
   * @param done
   */
  async deserializeUser(
    payload: UserEntity,
    done: (error: Error, payload: UserEntity) => void,
  ) {
    // 如果是管理员处理一下
    if (this.config.get('admins').hasOwnProperty(payload.loginname)) {
      payload['is_admin'] = true;
    }
    done(null, payload);
  }
  constructor(private readonly config: ConfigService) {
    super();
  }
}
