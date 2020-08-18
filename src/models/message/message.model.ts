import { index, prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { BaseModel, ObjectId } from '../base.model';

@index({ master_id: 1, has_read: -1, created_at: -1 })
export class Message extends BaseModel {
  // 类型
  @prop({
    type: String,
  })
  type: string;

  // 创建消息用户id
  @prop({
    type: ObjectId,
  })
  master_id: Types.ObjectId;

  // 作者id
  @prop({
    type: ObjectId,
  })
  author_id: Types.ObjectId;

  // 主题id
  @prop({
    type: ObjectId,
  })
  topic_id: Types.ObjectId;

  // 回复id
  @prop({
    type: ObjectId,
  })
  reply_id: Types.ObjectId;

  // 是否阅读
  @prop({
    type: Boolean,
    default: false,
  })
  has_read: boolean;
}
