import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthSerializer extends PassportSerializer {
    /**
     * 序列化用户信息后存储进 session
     * @param user
     * @param done
     */
    serializeUser(user: any, done: (error: null, user: any) => void) {
        done(null, user);
    }

    /**
     * 反序列化后取出用户信息
     * @param payload
     * @param done
     */
    async deserializeUser(payload: any, done: (error: null, payload: any) => void) {
        done(null, payload);
    }
    constructor() {
        super();
    }
}