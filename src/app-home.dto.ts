import { Transform } from "class-transformer";
import { ValidatorFilter, ViewsPath } from "./core";
import { IsOptional } from "class-validator";

@ValidatorFilter({
  render: ViewsPath.Home,
  locals: {
  },
  priority: {
  },
})
export class HomeDto {
  @IsOptional()
  @Transform(value => parseInt(value, 10) || 1, { toClassOnly: true })
  readonly page?: string;
  @IsOptional()
  @Transform(value => value || 'all', { toClassOnly: true })
  readonly tab?: string;
}
