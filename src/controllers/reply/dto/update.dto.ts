import { IsNotEmpty, IsOptional } from 'class-validator';
import { ValidatorFilter, ViewsPath } from '../../../core';

@ValidatorFilter({
  render: ViewsPath.ReplyEdit,
  locals: {
    content: true,
  },
  priority: {
    r_content: ['IsNotEmpty'],
  },
})
export class UpdateDto {
  @IsNotEmpty({
    message: '回复的字数太少。',
  })
  readonly content: string;
  @IsOptional()
  readonly _csrf?: string;
}
