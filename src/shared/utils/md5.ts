import * as utility from 'utility';

export const encryptMD5 = (key: string): string => utility.md5(key);

export const diffEncryptMD5 = (source: string, target: string): boolean => encryptMD5(source) === target;