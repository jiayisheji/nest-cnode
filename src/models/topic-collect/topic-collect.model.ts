import { index, prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { BaseModel, ObjectId } from '../base.model';

@index({ user_id: 1, topic_id: 1 }, { unique: true })
export class TopicCollect extends BaseModel {
  // 用户id
  @prop({
    type: ObjectId,
  })
  user_id: Types.ObjectId;
  // 主题id
  @prop({
    type: ObjectId,
  })
  topic_id: Types.ObjectId;
}
