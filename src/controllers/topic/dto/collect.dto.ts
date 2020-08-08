import { IsNotEmpty, IsOptional } from 'class-validator';
import { ValidatorFilter, ViewsPath } from '../../../core';

@ValidatorFilter({
  render: ViewsPath.TopicCreate,
  locals: {
    topic_id: true,
  },
  priority: {
    topic_id: ['IsNotEmpty'],
  },
})
export class CollectDto {
  @IsNotEmpty({
    message: '主题不能为空',
  })
  readonly topic_id: string;
  @IsOptional()
  readonly _csrf?: string;
}
