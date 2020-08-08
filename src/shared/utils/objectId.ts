import { Types } from "mongoose";

// ObjectId 采用12字节的存储空间，每个字节两位16进制数字，是一个24位的字符串
const OBJECT_ID_REGULAR = /[a-zA-Z0-9]{24}/

export const isObjectId = (id: string): boolean => OBJECT_ID_REGULAR.test(id);

export const toObjectId = (id: string): Types.ObjectId => isObjectId(id) && Types.ObjectId(id);