import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { ValidatorFilter, ViewsPath } from '../../../core';

@ValidatorFilter({
    render: ViewsPath.Notify,
    locals: {
        name: true,
        key: true,
    },
    priority: {
        name: ['IsNotEmpty'],
        key: ['IsNotEmpty'],
    },
})
export class AccountDto {
    @IsNotEmpty({
        message: 'name不能为空',
    })
    @Transform(value => value.toLowerCase(), { toClassOnly: true })
    readonly name: string;
    @IsNotEmpty({
        message: 'key不能为空',
    })
    readonly key: string;
}