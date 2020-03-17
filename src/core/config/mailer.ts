import { registerAs } from '@nestjs/config';
import { getEnv, getEnvNumber } from './utils';

export default registerAs('mailer', () => {
    const host = getEnv('MAIL_HOST');
    const port = getEnvNumber('MAIL_PORT');
    const user = getEnv('MAIL_USER');
    const pass = getEnv('MAIL_PASS');
    return {
        transport: {
            host,
            port,
            secure: true,
            secureConnection: true,
            auth: {
                user,
                pass,
            },
            ignoreTLS: true,
        }
    };
});