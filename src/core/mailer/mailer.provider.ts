import { MAILER_MODULE_OPTIONS, MAILER_TOKEN } from './mailer.constants';
import { createTransport } from 'nodemailer';

export const createMailerClient = <T>() => ({
    provide: MAILER_TOKEN,
    useFactory: (options: T) => {
        return createTransport(options);
    },
    inject: [MAILER_MODULE_OPTIONS],
});