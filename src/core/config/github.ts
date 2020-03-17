import { registerAs } from '@nestjs/config';
import { getEnv } from './utils';
import { GithubConfig } from './interfaces';

export default registerAs('github', (): GithubConfig => {
    const clientID = getEnv('GITHUB_CLIENT_ID');
    const clientSecret = getEnv('GITHUB_CLIENT_SECRET');
    const callbackURL = `${getEnv('GITHUB_CALLBACK_URL')}/${clientID}`;
    return {
        clientID: getEnv('GITHUB_CLIENT_ID'),
        clientSecret,
        callbackURL,
    };
});