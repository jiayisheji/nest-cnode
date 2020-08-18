import { arrayProp, buildSchema, index, prop } from '@typegoose/typegoose';
import { Schema, Types } from 'mongoose';
import { AnyType } from 'src/shared';
import { BaseModel, ObjectId } from '../base.model';

@index({ topic_id: 1, author_id: 1, created_at: -1 })
export class Reply extends BaseModel {
  // 内容
  @prop({
    type: String,
  })
  content: string;

  // 主题id
  @prop({
    type: ObjectId,
  })
  topic_id: Types.ObjectId;

  // 作者id
  @prop({
    type: ObjectId,
  })
  author_id: Types.ObjectId;

  // 二级回复id
  @prop({
    type: ObjectId,
  })
  reply_id: Types.ObjectId;

  // 回复id
  @arrayProp({
    items: ObjectId,
  })
  ups: Types.ObjectId[];

  // 内容是否html
  @prop({
    type: Boolean,
    default: false,
  })
  content_is_html: boolean;

  // 是否删除 软删除，只是标记不能显示，数据库不删除
  @prop({
    type: Boolean,
    default: false,
  })
  deleted: boolean;

  static get schema(): Schema {
    return buildSchema(this as AnyType, {
      ...super.schema['options'],
      usePushEach: true,
    });
  }
}
