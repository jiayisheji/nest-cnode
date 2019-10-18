import { Schema } from 'mongoose';
import { schemaOptions } from '../base.schema';
import { Topic } from './topic.interface';

export const TopicSchema = new Schema({
    title: { type: String },
    content: { type: String },
    author_id: { type: Schema.Types.ObjectId },
    top: { type: Boolean, default: false },
    good: { type: Boolean, default: false },
    lock: { type: Boolean, default: false },
    reply_count: { type: Number, default: 0 },
    visit_count: { type: Number, default: 0 },
    collect_count: { type: Number, default: 0 },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    last_reply: { type: Schema.Types.ObjectId },
    last_reply_at: { type: Date, default: Date.now },
    content_is_html: { type: Boolean },
    tab: { type: String },
    deleted: { type: Boolean, default: false },
}, schemaOptions);

// 设置索引
TopicSchema.index({ create_at: -1 });
TopicSchema.index({ top: -1, last_reply_at: -1 });
TopicSchema.index({ author_id: 1, create_at: -1 });

/* // 设置虚拟属性
UserSchema.virtual('avatar_url').get(function() {
    let url = this.avatar || `https://gravatar.com/avatar/${utility.md5(this.email)}?size=48`;

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
});

UserSchema.virtual('isAdvanced').get(function() {
    // 积分高于 700 则认为是高级用户
    return this.score > 700 || this.is_star;
});

// 设置保存中间件
UserSchema.pre('save', function(next) {
    const now = new Date();
    (this as User).update_at = now;
    next();
}); */