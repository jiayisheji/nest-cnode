import { Transform } from 'class-transformer';
import { Matches, IsByteLength, IsNotEmpty, IsEmail, IsOptional, MinLength } from 'class-validator';
import { IsEqualsThan, ViewsPath, ValidatorFilter } from 'src/core';

@ValidatorFilter({
    render: ViewsPath.Register,
    locals: {
        loginname: true,
        pass: false,
        re_pass: false,
        email: true,
    },
    priority: {
        loginname: ['MinLength', 'Matches'],
        pass: ['IsNotEmpty', 'IsByteLength'],
        re_pass: ['IsNotEmpty', 'IsEqualsThan'],
        email: ['IsNotEmpty', 'IsEmail'],
    },
})
export class RegisterDto {
    @MinLength(5, {
        message: '用户名至少需要5个字符',
    })
    @Matches(/^[a-zA-Z0-9\-_]\w{4,20}$/, {
        message: '用户名不合法',
    })
    @Transform(value => value.toLowerCase(), { toClassOnly: true })
    readonly loginname: string;
    @IsNotEmpty({
        message: '密码不能为空',
    })
    @IsByteLength(6, 18, {
        message: '密码长度不是6-18位',
    })
    readonly pass: string;
    @IsNotEmpty({
        message: '确认密码不能为空',
    })
    @IsEqualsThan('pass', {
        message: '两次密码输入不一致。',
    })
    readonly re_pass: string;
    @IsNotEmpty({
        message: '邮箱不能为空',
    })
    @IsEmail({}, {
        message: '邮箱不合法',
    })
    @Transform(value => value.toLowerCase(), { toClassOnly: true })
    readonly email: string;
    @IsOptional()
    readonly _csrf?: string;
}