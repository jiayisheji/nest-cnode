import { IsByteLength, IsNotEmpty, IsOptional } from 'class-validator';
import { ValidatorFilter, ViewsPath } from '../../../core';

@ValidatorFilter({
  render: ViewsPath.TopicCreate,
  locals: {
    title: true,
    key: true,
  },
  priority: {
    title: ['IsNotEmpty'],
  },
})
export class CreateDto {
  @IsNotEmpty({
    message: '标题不能为空',
  })
  @IsByteLength(5, 100, {
    message: '标题长度为5-100字符',
  })
  readonly title: string;
  @IsNotEmpty({
    message: '内容不能为空',
  })
  readonly content: string;
  @IsNotEmpty({
    message: '版块不能为空',
  })
  readonly tab: string;
  @IsOptional()
  readonly topic_tags?: string;
  @IsOptional()
  readonly _csrf?: string;
}
