import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthSerializer extends PassportSerializer {
    /**
     * 序列化用户
     * @param user
     * @param done
     */
    serializeUser(user: any, done: (error: null, user: any) => any) {
        done(null, user);
    }

    /**
     * 反序列化用户
     * @param payload
     * @param done
     */
    async deserializeUser(payload: any, done: (error: null, payload: any) => any) {
        done(null, payload);
    }
    constructor() {
        super();
    }
}