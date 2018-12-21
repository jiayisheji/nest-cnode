import { Injectable, Optional, ArgumentMetadata, PipeTransform } from '@nestjs/common';

import * as classTransformer from 'class-transformer';
import * as classValidator from 'class-validator';
import { ValidatorOptions } from '@nestjs/common/interfaces/external/validator-options.interface';

import { isNil } from 'lodash';
import { ValidationError } from 'class-validator';
import { VALIDATOR_FILTER } from '../constants/validator-filter.constants';
import { ValidatorFilterContext } from '../decorators';

export interface ValidationPipeOptions extends ValidatorOptions {
    transform?: boolean;
    disableErrorMessages?: boolean;
}

@Injectable()
export class ViewValidationPipe implements PipeTransform<any> {
    protected isTransformEnabled: boolean;
    protected isDetailedOutputDisabled: boolean;
    protected validatorOptions: ValidatorOptions;

    constructor(@Optional() options?: ValidationPipeOptions) {
        options = Object.assign({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: false,
            forbidUnknownValues: true,
        }, options || {});
        const { transform, disableErrorMessages, ...validatorOptions } = options;
        this.isTransformEnabled = !!transform;
        this.validatorOptions = validatorOptions;
        this.isDetailedOutputDisabled = disableErrorMessages;
    }

    public async transform(value, metadata: ArgumentMetadata) {
        const { metatype } = metadata;
        if (!metatype || !this.toValidate(metadata)) {
            return value;
        }
        const entity = classTransformer.plainToClass(
            metatype,
            this.toEmptyIfNil(value),
        );
        const errors = await classValidator.validate(entity, this.validatorOptions);
        if (errors.length > 0) {
            return validationErrorMessage(errors);
        }
        return this.isTransformEnabled
            ? entity
            : Object.keys(this.validatorOptions).length > 0
                ? classTransformer.classToPlain(entity)
                : value;
    }

    private toValidate(metadata: ArgumentMetadata): boolean {
        const { metatype, type } = metadata;
        if (type === 'custom') {
            return false;
        }
        const types = [String, Boolean, Number, Array, Object];
        return !types.some(t => metatype === t) && !isNil(metatype);
    }

    toEmptyIfNil<T = any, R = any>(value: T): R | {} {
        return isNil(value) ? {} : value;
    }
}

interface Render {
    view: string;
    locals: {
        error: string;
        [key: string]: any;
    };
}

function validationErrorMessage(messages: ValidationError[]): Render {
    const message: ValidationError = messages[0];
    const metadata: ValidatorFilterContext = Reflect.getMetadata(VALIDATOR_FILTER, message.target.constructor);
    if (!metadata) {
        throw Error('context is not undefined, use @ValidatorFilter(context)');
    }
    // 处理错误消息显示
    const priorities = metadata.priority[message.property];
    let error = '';
    const notFound = priorities.some((key) => {
        key = key.replace(/\b(\w)(\w*)/g, ($0, $1, $2) => {
            return $1.toLowerCase() + $2;
        });
        if (!!message.constraints[key]) {
            error = message.constraints[key];
            return true;
        }
    });
    // 没有找到对应错误消息，取第一个
    if (!notFound) {
        error = message.constraints[Object.keys(message.constraints)[0]];
    }
    // 处理错误以后显示数据
    const locals = Object.keys(metadata.locals).reduce((obj, key) => {
        if (metadata.locals[key]) {
            obj[key] = message.target[key];
        }
        return obj;
    }, {});

    return {
        view: metadata.render,
        locals: {
            error,
            ...locals,
        },
    };
}