export interface GithubConfig {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
}

export default {
    clientID: '{{env.GITHUB_CLIENT_ID}}',
    clientSecret: '{{env.GITHUB_CLIENT_SECRET}}',
    callbackURL: '{{env.GITHUB_CALLBACK_URL}}/{{env.GITHUB_CLIENT_ID}}',
};