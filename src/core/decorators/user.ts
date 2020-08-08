import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const User = createParamDecorator((data: string, req: Request) => {
    return data ? req.user?.[data] : req.user;
});