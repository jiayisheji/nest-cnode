import 'reflect-metadata';
import { VALIDATOR_FILTER } from '../constants/validator-filter.constants';

export interface ValidatorFilterContext {
    render: string;
    locals: { [key: string]: boolean };
    priority: { [key: string]: string[] };
}

export function ValidatorFilter(context: ValidatorFilterContext): ClassDecorator {
    return (target: any) => Reflect.defineMetadata(VALIDATOR_FILTER, context, target);
}