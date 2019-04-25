import { Strategy } from 'passport-github';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'config';

export interface GitHubProfile {
    id: string;
    displayName: string;
    username: string;
    profileUrl: string;
    emails: { value: string }[];
    photos: { value: string }[];
    provider: string;
    _raw: string;
    _json: {
        'login': string;
        'id': number;
        'node_id': string;
        'avatar_url': string;
        'gravatar_id': string;
        'url': string;
        'html_url': string;
        'followers_url': string;
        'following_url': string;
        'gists_url': string;
        'starred_url': string;
        'subscriptions_url': string;
        'organizations_url': string;
        'repos_url': string;
        'events_url': string;
        'received_events_url': string;
        'type': string;
        'site_admin': boolean;
        'name': string;
        'company': null;
        'blog': string;
        'location': null;
        'email': string;
        'hireable': null;
        'bio': null;
        'public_repos': number;
        'public_gists': number;
        'followers': number;
        'following': number;
        'created_at': string;
        'updated_at': string;
    };
    accessToken: string;
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly config: ConfigService) {
        super({
            clientID: config.get('GITHUB_CLIENT_ID'),
            clientSecret: config.get('GITHUB_CLIENT_SECRET'),
            callbackURL: `${config.get('HOST')}:${config.get('PORT')}/github/callback`,
        });
    }

    // tslint:disable-next-line:ban-types
    async validate(accessToken, refreshToken, profile: GitHubProfile, done: Function) {
        console.log('GithubStrategy validate', accessToken, refreshToken, profile);
        profile.accessToken = accessToken;
        done(null, profile);
    }
}