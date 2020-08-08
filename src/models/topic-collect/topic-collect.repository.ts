import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { BaseRepository } from '../base.repository';
import { ModelPartial } from '../repository';
import { UserRepository } from '../user';
import { TopicCollect } from './topic-collect.model';

/**
 * 帖子实体
 */
export type TopicCollectEntity = DocumentType<TopicCollect>;
/**
 * 帖子模型
 */
export type TopicCollectModel = ReturnModelType<typeof TopicCollect>;
/**
 * 帖子模型名称
 */
export const TopicCollectModelName = TopicCollect.modelName;

@Injectable()
export class TopicCollectRepository extends BaseRepository<TopicCollect> {
  constructor(
    @InjectModel(TopicCollectModelName)
    private readonly _topicModel: TopicCollectModel,
    private readonly userRepository: UserRepository,
  ) {
    super(_topicModel);
  }

  async save({ user_id, topic_id }: ModelPartial<TopicCollect>) {
    const topic_collect = this.create();
    topic_collect.user_id = TopicCollectRepository.toObjectId(user_id);
    topic_collect.topic_id = TopicCollectRepository.toObjectId(topic_id);
    return await super.save(topic_collect);
  }
}
