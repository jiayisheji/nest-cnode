import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Type } from '@nestjs/common';
export interface MailerModuleOptions{
    transport: 'SMTPTransport' | 'SMTPPool' | 'SendmailTransport' | 'StreamTransport' | 'JSONTransport' | 'SESTransport' | 'Transport';
    [key: string]: any;
}

import * as JSONTransport from 'nodemailer/lib/json-transport';
import * as SendmailTransport from 'nodemailer/lib/sendmail-transport';
import * as SESTransport from 'nodemailer/lib/ses-transport';
import * as SMTPPool from 'nodemailer/lib/smtp-pool';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as StreamTransport from 'nodemailer/lib/stream-transport';

export { TransportOptions } from 'nodemailer';
export interface SendmailTransportOptions extends SendmailTransport.Options {}
export interface JSONTransportOptions extends JSONTransport.Options {}
export interface SESTransportOptions extends SESTransport.Options {}
export interface SMTPTransportOptions extends SMTPTransport.Options {}
export interface SMTPPoolOptions extends SMTPPool.Options {}
export interface StreamTransportOptions extends StreamTransport.Options {}

export interface MailerOptionsFactory<T> {
    createMailerOptions(): Promise<T> | T;
}

export interface MailerModuleAsyncOptions<T> extends Pick<ModuleMetadata, 'imports'> {
    /**
     * 模块的名称
     */
    name?: string;
    /**
     * 应该用于提供MailerOptions的类
     */
    useClass?: Type<T>;
    /**
     * 工厂应该用来提供MailerOptions
     */
    useFactory?: (...args: any[]) => Promise<T> | T;
    /**
     * 应该注入的提供者
     */
    inject?: any[];
}