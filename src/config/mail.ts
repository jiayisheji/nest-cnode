import { getEnv, getEnvNumber } from 'core/config/env';

export interface MailConfig {
    // 邮箱smtp地址
    host: string;
    // 端口号
    port: number;
    // 安全
    secure: boolean;
    // 安全连接
    secureConnection: boolean;
    // 认证
    auth: {
        // 邮箱账号
        user: string;
        // 授权码
        pass: string;
    };
    // 忽略TLS
    ignoreTLS: boolean;
}

export default {
    host: '{{env.MAIL_HOST}}',
    port: '{{env.MAIL_PORT}}',
    secure: true,
    secureConnection: true,
    auth: {
        user: '{{env.MAIL_USER}}',
        pass: '{{env.MAIL_PASS}}',
    },
    ignoreTLS: true,
};