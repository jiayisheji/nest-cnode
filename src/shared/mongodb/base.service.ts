import { Model, Document, Types, ModelFindByIdAndUpdateOptions } from 'mongoose';
import { WriteOpResult } from 'mongodb';

export abstract class BaseService<T extends Document> {
    /**
     * 模型实例
     * @protected
     * @type {Model<T>}
     * @memberof BaseService
     */
    protected _model: Model<T>;

    /**
     * 转化数据
     * @template K
     * @param {(Partial<T> | Partial<T>[])} object
     * @param {*} destinationKey
     * @returns {Promise<K>}
     * @memberof BaseService
     */
    async map<K>(
        object: Partial<T> | Partial<T>[],
        destinationKey: any,
    ): Promise<K|K[]> {
        const props = Object.keys(new destinationKey());
        if (Array.isArray(object)) {
            const destinations = object.map((item: T) => basePick(item.toJSON(), props));
            return Promise.resolve(destinations as K[]);
        }
        const destination = basePick(object.toJSON(), props);
        return Promise.resolve(destination as K);
    }

    /**
     * 获取全部
     * @param {*} [filter={}]
     * @returns {Promise<T[]>}
     * @memberof BaseService
     */
    findAll(conditions: any, projection?: any | null, options?: any | null): Promise<T[]> {
        return this._model.find(conditions, projection, options).exec();
    }

    /**
     * 获取单条数据
     * @param {*} [filter={}]
     * @returns {Promise<T>}
     * @memberof BaseService
     */
    findOne(conditions: any, projection?: any, options?: any): Promise<T | null> {
        return this._model.findOne(conditions, projection, options).exec();
    }

    /**
     * 根据id获取单条数据
     * @param {*} [filter={}]
     * @returns {Promise<T>}
     * @memberof BaseService
     */
    findById(id: any | string | number, projection?: any, options?: any): Promise<T | null> {
        return this._model.findById(this.toObjectId(id), projection, options).exec();
    }

    /**
     * 获取指定查询条件的数量
     * @param {*} conditions
     * @returns {Promise<number>}
     * @memberof UserService
     */
    count(conditions: any): Promise<number> {
        return this._model.count(conditions).exec();
    }

    /**
     * 创建一条数据
     * @param {T} docs
     * @returns {Promise<T>}
     * @memberof BaseService
     */
    async create(docs: T): Promise<T> {
        return this._model.create(docs);
    }

    /**
     * 删除指定id数据
     * @param {string} id
     * @returns {Promise<T>}
     * @memberof BaseService
     */
    async delete(id: string, options: {
        /** if multiple docs are found by the conditions, sets the sort order to choose which doc to update */
        sort?: any;
        /** sets the document fields to return */
        select?: any;
    }): Promise<T | null> {
        return this._model.findByIdAndRemove(this.toObjectId(id), options).exec();
    }

    /**
     * 更新指定id数据
     * @param {string} id
     * @param {Partial<T>} [item={}]
     * @returns {Promise<T>}
     * @memberof BaseService
     */
    async update(id: any | number | string, update: Partial<T>, options: ModelFindByIdAndUpdateOptions = { new: true }): Promise<T | null> {
        return this._model.findByIdAndUpdate(this.toObjectId(id), update, options).exec();
    }

    /**
     * 从集合中删除文档
     * @param {*} [conditions={}]
     * @returns {Promise<void>}
     * @memberof BaseService
     */
    async clearCollection(conditions = {}): Promise<WriteOpResult['result']> {
        return this._model.deleteMany(conditions).exec();
    }

    /**
     * 转换ObjectId
     * @private
     * @param {string} id
     * @returns {Types.ObjectId}
     * @memberof BaseService
     */
    private toObjectId(id: string): Types.ObjectId {
        return Types.ObjectId(id);
    }

}

export function basePick(object, props) {
    object = Object(object);
    return basePickBy(object, props, (value, key) => {
        return key in object;
    });
}

function basePickBy(object, props, predicate) {
    let index = -1;
    const length = props.length;
    const result = {};

    while (++index < length) {
        const key = props[index],
            value = object[key];

        if (predicate(value, key)) {
            result[key] = value;
        }
    }
    return result;
}