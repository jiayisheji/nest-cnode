import { prop, pre } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import { encryptMD5 } from 'src/shared';
import { BaseModel } from '../base.model';

@pre<User>('save', function (next) {
    const now = new Date();
    (this as User).updated_at = now;
    next();
})
export class User extends BaseModel {

    get avatar_url(): string {
        let url = this.avatar || `https://gravatar.com/avatar/${encryptMD5(this.email)}?size=48`;

        // www.gravatar.com 被墙
        url = url.replace('www.gravatar.com', 'gravatar.com');

        // 让协议自适应 protocol，使用 `//` 开头
        if (url.indexOf('http:') === 0) {
            url = url.slice(5);
        }

        // 如果是 github 的头像，则限制大小
        if (url.indexOf('githubusercontent') !== -1) {
            url += '&s=120';
        }
        return url;
    }

    get isAdvanced(): boolean {
        // 积分高于 700 则认为是高级用户
        return this.score > 700 || this.is_star;
    }

    @prop({
        type: Schema.Types.String,
    })
    name: string;

    @prop({
        index: true,
        unique: true,
        type: Schema.Types.String,
    })
    loginname: string;

    @prop({
        select: false,
        type: Schema.Types.String,
    })
    pass: string;

    @prop({
        index: true,
        unique: true,
        type: Schema.Types.String,
    })
    email: string;

    @prop({
        type: Schema.Types.String,
    })
    url: string;

    @prop({
        type: Schema.Types.String,
    })
    profile_image_url: string;

    @prop({
        type: Schema.Types.String,
    })
    location: string;

    @prop({
        type: Schema.Types.String,
    })
    signature: string;

    @prop({
        type: Schema.Types.String,
    })
    profile: string;

    @prop({
        type: Schema.Types.String,
    })
    weibo: string;

    @prop({
        type: Schema.Types.String,
    })
    avatar: string;

    @prop({
        index: true,
        type: Schema.Types.String,
    })
    githubId: string;

    @prop({
        type: Schema.Types.String,
    })
    githubUsername: string;

    @prop({
        index: true,
        type: Schema.Types.String,
    })
    githubAccessToken: string;

    @prop({
        default: false,
        type: Schema.Types.Boolean,
    })
    is_block: boolean;

    @prop({
        default: 0,
        type: Schema.Types.Number,
    })
    score: number;

    @prop({
        default: 0,
        type: Schema.Types.Number,
    })
    topic_count: number;

    @prop({
        default: 0,
        type: Schema.Types.Number,
    })
    reply_count: number;

    @prop({
        default: 0,
        type: Schema.Types.Number,
    })
    follower_count: number;

    @prop({
        default: 0,
        type: Schema.Types.Number,
    })
    following_count: number;

    @prop({
        default: 0,
        type: Schema.Types.Number,
    })
    collect_tag_count: number;

    @prop({
        default: 0,
        type: Schema.Types.Number,
    })
    collect_topic_count: number;

    @prop({
        default: false,
        type: Schema.Types.Boolean,
    })
    is_star: boolean;

    @prop({
        type: Schema.Types.String,
    })
    level: string;

    @prop({
        default: false,
        type: Schema.Types.Boolean,
    })
    active: boolean;

    @prop({
        default: false,
        type: Schema.Types.Boolean,
    })
    receive_reply_mail: boolean;

    @prop({
        default: false,
        type: Schema.Types.Boolean,
    })
    receive_at_mail: boolean;

    @prop({
        type: Schema.Types.Boolean,
    })
    from_wp: boolean;

    @prop({
        type: Schema.Types.String,
    })
    retrieve_key: string;

    @prop({
        default: 0,
        type: Schema.Types.Number,
    })
    retrieve_time: number;

    @prop({
        type: Schema.Types.String,
    })
    accessToken: string;
}

