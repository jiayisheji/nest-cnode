import { Schema } from 'mongoose';
import { buildSchema, prop } from '@typegoose/typegoose';
import { AnyType } from 'src/shared/interfaces';
/** 名词解释
 * - Schema: 一种以文件形式存储的数据库模型骨架，不具备数据库的操作能力
 * - Model: 由Schema发布生成的模型，具有抽象属性和数据库操作能力
 * - Entity: 由Model创建的实例, 也能操作数据库
 * Schema、Model、Entity 的关系请牢记
 * Schema 生成 Model，Model 创造 Entity
 * Model 和 Entity 都可对数据库操作造成影响
 * 但 Model 比 Entity 更具操作性
 */
export abstract class BaseModel {
    @prop()
    created_at?: Date; // 创建时间
    @prop()
    updated_at?: Date; // 更新时间

    public id?: string; // 实际上是 model._id getter

    // 如果需要，可以向基本模型添加更多内容。

    static get schema(): Schema {
        return buildSchema(this as AnyType, {
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            },
            toJSON: {
                virtuals: true,
                getters: true,
                versionKey: false,
            },
        });
    }

    static get modelName(): string {
        return this.name;
    }
}