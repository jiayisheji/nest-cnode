import { IsNotEmpty, IsOptional } from 'class-validator';
import { ValidatorFilter, ViewsPath } from '../../../core';

@ValidatorFilter({
  render: ViewsPath.TopicCreate,
  locals: {
    r_content: true,
  },
  priority: {
    r_content: ['IsNotEmpty'],
  },
})
export class CreateDto {
  @IsNotEmpty({
    message: '回复内容不能为空!',
  })
  readonly r_content: string;
  @IsOptional()
  readonly reply_id?: string;
  @IsOptional()
  readonly _csrf?: string;
}
