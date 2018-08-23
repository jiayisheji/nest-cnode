import { Document, Types } from 'mongoose';

export interface BaseInterface extends Document {
    _id: Types.ObjectId;  // mongodb id
    id: Types.ObjectId; // mongodb id
    create_at: Date; // 创建时间
    update_at: Date; // 更新时间
}