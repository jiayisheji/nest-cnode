import { index, prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { BaseModel, ObjectId } from '../base.model';

@index({ create_at: -1, top: -1, last_reply_at: -1, author_id: 1 })
export class Topic extends BaseModel {
  // 标题
  @prop({
    type: String,
  })
  title: string;

  // 内容
  @prop({
    type: String,
  })
  content: string;

  // 作者id
  @prop({
    type: ObjectId,
  })
  author_id: Types.ObjectId;

  // 置顶帖
  @prop({
    type: Boolean,
    default: false,
  })
  top: boolean;

  // 精华帖
  @prop({
    type: Boolean,
    default: false,
  })
  good: boolean;

  // 被锁定主题
  @prop({
    type: Boolean,
    default: false,
  })
  lock: boolean;

  // 评论数
  @prop({
    type: Number,
    default: 0,
  })
  reply_count: number;

  // 阅读数
  @prop({
    type: Number,
    default: 0,
  })
  visit_count: number;

  // 收藏数
  @prop({
    type: Number,
    default: 0,
  })
  collect_count: number;

  // 最后回复者
  @prop({
    type: ObjectId,
  })
  last_reply: Types.ObjectId;

  // 最后回复时间
  @prop({
    type: Date,
    default: Date.now,
  })
  last_reply_at: Date;

  // 内容是否html
  @prop({
    type: Boolean,
    default: false,
  })
  content_is_html: boolean;

  // 标签分类
  @prop({
    type: String,
  })
  tab: string;

  // 是否删除 软删除，只是标记不能显示，数据库不删除
  @prop({
    type: Boolean,
    default: false,
  })
  deleted: boolean;
}
