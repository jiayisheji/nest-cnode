import {
    ModelPopulateOptions,
    QueryFindOneAndUpdateOptions,
    Types,
    DocumentQuery,
    QueryFindOneAndRemoveOptions,
    Query,
} from 'mongoose';
import { WriteOpResult, FindAndModifyWriteOpResultObject, MongoError } from 'mongodb';
import { Transform } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';

import { AnyType } from 'src/shared/interfaces';
import { BaseModel } from './base.model';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
import { InternalServerErrorException } from '@nestjs/common';

export type OrderType<T> = Record<keyof T, 'asc' | 'desc' | 'ascending' | 'descending' | 1 | -1>;


export type QueryList<T extends BaseModel> = DocumentQuery<Array<DocumentType<T>>, DocumentType<T>>;
export type QueryItem<T extends BaseModel> = DocumentQuery<DocumentType<T>, DocumentType<T>>;


/**
 * Describes generic pagination params
 */
export abstract class PaginationParams<T> {
    /**
     * Pagination limit
     */
    @IsOptional()
    @Min(1)
    @Max(50)
    @Transform((val: string) => parseInt(val, 10) || 10)
    public readonly limit = 10;

    /**
     * Pagination offset
     */
    @IsOptional()
    @Min(0)
    @Transform((val: string) => parseInt(val, 10))
    public readonly offset: number;

    /**
     * Pagination page
     */
    @IsOptional()
    @Min(1)
    @Transform((val: string) => parseInt(val, 10))
    public readonly page: number;

    /**
     * OrderBy
     */
    @IsOptional()
    public abstract readonly order?: OrderType<T>;
}

/**
 * 分页器返回结果
 * @export
 * @interface Paginator
 * @template T
 */
export interface Paginator<T> {
    /**
     * 分页数据
     */
    items: T[];
    /**
     * 总条数
     */
    total: number;
    /**
     * 一页多少条
     */
    limit: number;
    /**
     * 偏移
     */
    offset?: number;
    /**
     * 当前页
     */
    page?: number;
    /**
     * 总页数
     */
    pages?: number;
}

export abstract class BaseRepository<T extends BaseModel> {
    constructor(protected model: ReturnModelType<AnyParamConstructor<T>>) { }

    /**
     * @description 抛出mongodb异常
     * @protected
     * @static
     * @param {MongoError} err
     * @memberof BaseRepository
     */
    protected static throwMongoError(err: MongoError): void {
        throw new InternalServerErrorException(err, err.errmsg);
    }

    /**
     * @description 将字符串转换成ObjectId
     * @protected
     * @static
     * @param {string} id
     * @returns {Types.ObjectId}
     * @memberof BaseRepository
     */
    protected static toObjectId(id: string): Types.ObjectId {
        try {
            return Types.ObjectId(id);
        } catch (e) {
            this.throwMongoError(e);
        }
    }

    /**
     * @description 创建模型
     * @param {Partial<T>} [doc]
     * @returns {DocumentType<T>}
     * @memberof BaseRepository
     */
    createModel(doc?: Partial<T>): T {
        return new this.model(doc);
    }

    /**
     * @description 获取指定条件全部数据
     * @param {*} conditions
     * @param {(Object | string)} [projection]
     * @param {({
     *     sort?: OrderType<T>;
     *     limit?: number;
     *     skip?: number;
     *     lean?: boolean;
     *     populates?: ModelPopulateOptions[] | ModelPopulateOptions;
     *     [key: string]: any;
     *   })} [options]
     * @returns {QueryList<T>}
     */
    public findAll(conditions: AnyType, projection?: object | string, options: {
        sort?: OrderType<T>;
        limit?: number;
        skip?: number;
        lean?: boolean;
        populates?: ModelPopulateOptions[] | ModelPopulateOptions;
        [key: string]: AnyType;
    } = {}): QueryList<T> {
        return this.model.find(conditions, projection, options);
    }

    public async findAllAsync(conditions: AnyType, projection?: object | string, options: {
        sort?: OrderType<T>;
        limit?: number;
        skip?: number;
        lean?: boolean;
        populates?: ModelPopulateOptions[] | ModelPopulateOptions;
        [key: string]: AnyType;
    } = {}): Promise<Array<DocumentType<T>>> {
        const { populates = null, ...option } = options;
        const docsQuery = this.findAll(conditions, projection, option);
        try {
            return await this.populates<Array<DocumentType<T>>>(docsQuery, populates);
        } catch (e) {
            BaseRepository.throwMongoError(e);
        }
    }

    /**
     * @description 获取带分页数据
     * @param {PaginationParams<T>} conditions
     * @param {(Object | string)} [projection]
     * @param {({
     *     lean?: boolean;
     *     populates?: ModelPopulateOptions[] | ModelPopulateOptions;
     *     [key: string]: any;
     *   })} [options={}]
     * @returns {Promise<Paginator<T>>}
     */
    public async paginator(conditions: PaginationParams<T>, projection?: object | string, options: {
        lean?: boolean;
        populates?: ModelPopulateOptions[] | ModelPopulateOptions;
        [key: string]: AnyType;
    } = {}): Promise<Paginator<T>> {
        const { limit, offset, page, order, ...query } = conditions;

        // 拼装分页返回参数
        const result: Paginator<T> = {
            items: [],
            total: 0,
            limit,
            offset: 0,
            page: 1,
            pages: 0,
        };

        // 拼装查询配置参数
        options.sort = order;
        options.limit = limit;

        // 处理起始位置
        if (offset !== undefined) {
            result.offset = offset;
            options.skip = offset;
        } else if (page !== undefined) {
            result.page = page;
            options.skip = (page - 1) * limit;
            result.pages = Math.ceil(result.total / limit) || 1;
        } else {
            options.skip = 0;
        }

        try {
            // 获取分页数据
            result.items = await this.findAllAsync(query, projection, options);
            // 获取总条数
            result.total = await this.count(query);
            // 返回分页结果
            return Promise.resolve(result);
        } catch (e) {
            BaseRepository.throwMongoError(e);
        }
    }

    /**
     * @description 获取单条数据
     * @param {*} conditions
     * @param {(Object | string)} [projection]
     * @param {({
     *     lean?: boolean;
     *     populates?: ModelPopulateOptions[] | ModelPopulateOptions;
     *     [key: string]: any;
     *   })} [options]
     * @returns {QueryItem<T>}
     */
    public findOne(conditions: AnyType, projection?: object | string, options: {
        lean?: boolean;
        populates?: ModelPopulateOptions[] | ModelPopulateOptions;
        [key: string]: AnyType;
    } = {}): QueryItem<T> {
        return this.model.findOne(conditions, projection || {}, options);
    }

    public findOneAsync(conditions: AnyType, projection?: object | string, options: {
        lean?: boolean;
        populates?: ModelPopulateOptions[] | ModelPopulateOptions;
        [key: string]: AnyType;
    } = {}): Promise<T | null> {
        try {
            const { populates = null, ...option } = options;
            const docsQuery = this.findOne(conditions, projection || {}, option);
            return this.populates<T>(docsQuery, populates).exec();
        } catch (e) {
            BaseRepository.throwMongoError(e);
        }
    }

    /**
     * @description 根据id获取单条数据
     * @param {(string)} id
     * @param {(Object | string)} [projection]
     * @param {({
     *     lean?: boolean;
     *     populates?: ModelPopulateOptions[] | ModelPopulateOptions;
     *     [key: string]: any;
     *   })} [options={}]
     * @returns {QueryItem<T>}
     */
    public findById(id: string, projection?: object | string, options: {
        lean?: boolean;
        populates?: ModelPopulateOptions[] | ModelPopulateOptions;
        [key: string]: AnyType;
    } = {}): QueryItem<T> {
        return this.model.findById(BaseRepository.toObjectId(id), projection, options)
    }

    public findByIdAsync(id: string, projection?: object | string, options: {
        lean?: boolean;
        populates?: ModelPopulateOptions[] | ModelPopulateOptions;
        [key: string]: AnyType;
    } = {}): Promise<T | null> {
        try {
            const { populates = null, ...option } = options;
            const docsQuery = this.findById(id, projection || {}, option);
            return this.populates<T>(docsQuery, populates).exec();
        } catch (e) {
            BaseRepository.throwMongoError(e);
        }
    }

    /**
     * @description 获取指定查询条件的数量
     * @param {*} conditions
     * @returns {Query<number>}
     */
    public count(conditions: AnyType): Query<number> {
        return this.model.count(conditions)
    }

    public countAsync(conditions: AnyType): Promise<number> {
        try {
            return this.count(conditions).exec();
        } catch (e) {
            BaseRepository.throwMongoError(e);
        }
    }

    /**
     * @description 创建一条数据
     * @param {Partial<T>} docs
     * @returns {Promise<DocumentType<T>>}
     */
    public async create(docs: Partial<T>): Promise<DocumentType<T>> {
        try {
            return await this.model.create(docs);
        } catch (e) {
            BaseRepository.throwMongoError(e);
        }
    }

    /**
     * @description 删除指定数据
     * @param {(any)} id
     * @param {QueryFindOneAndRemoveOptions} options
     * @returns {QueryItem<T>}
     */
    public delete(
        conditions: AnyType,
        options?: QueryFindOneAndRemoveOptions,
    ): QueryItem<T> {
        return this.model.findOneAndDelete(conditions, options);
    }

    public async deleteAsync(
        conditions: AnyType,
        options?: QueryFindOneAndRemoveOptions,
    ): Promise<DocumentType<T>> {
        try {
            return await this.delete(conditions, options).exec();
        } catch (e) {
            BaseRepository.throwMongoError(e);
        }
    }

    /**
     * @description 删除指定id数据
     * @param {(any)} id
     * @param {QueryFindOneAndRemoveOptions} options
     * @returns {Query<FindAndModifyWriteOpResultObject<DocumentType<T>>>}
     */
    public deleteById(
        id: string,
        options?: QueryFindOneAndRemoveOptions,
    ): Query<FindAndModifyWriteOpResultObject<DocumentType<T>>> {
        return this.model.findByIdAndDelete(BaseRepository.toObjectId(id), options);
    }

    public async deleteByIdAsync(
        id: string,
        options?: QueryFindOneAndRemoveOptions,
    ): Promise<FindAndModifyWriteOpResultObject<DocumentType<T>>> {
        try {
            return await this.deleteById(id, options).exec();
        } catch (e) {
            BaseRepository.throwMongoError(e);
        }
    }

    /**
     * @description 更新指定id数据
     * @param {string} id
     * @param {Partial<T>} update
     * @param {QueryFindOneAndUpdateOptions} [options={ new: true }]
     * @returns {QueryItem<T>}
     */
    public update(id: string, update: Partial<T>, options: QueryFindOneAndUpdateOptions = { new: true }): QueryItem<T> {
        return this.model.findByIdAndUpdate(BaseRepository.toObjectId(id), update, options);
    }

    async updateAsync(id: string, update: Partial<T>, options: QueryFindOneAndUpdateOptions = { new: true }): Promise<DocumentType<T>> {
        try {
            return await this.update(id, update, options).exec();
        } catch (e) {
            BaseRepository.throwMongoError(e);
        }
    }

    /**
     * @description 删除所有匹配条件的文档集合
     * @param {*} [conditions={}]
     * @returns {Promise<WriteOpResult['result']>}
     */
    public clearCollection(conditions: AnyType = {}): Promise<WriteOpResult['result']> {
        try {
            return this.model.deleteMany(conditions).exec();
        } catch (e) {
            BaseRepository.throwMongoError(e);
        }
    }

    /**
     * @description 填充其他模型
     * @private
     * @template D
     * @param {DocumentQuery<D, DocumentType<T>, {}>} docsQuery
     * @param {(ModelPopulateOptions | ModelPopulateOptions[] | null)} populates
     * @returns {DocumentQuery<D, DocumentType<T>, {}>}
     */
    private populates<D>(
        docsQuery: DocumentQuery<D, DocumentType<T>, {}>,
        populates: ModelPopulateOptions | ModelPopulateOptions[] | null): DocumentQuery<D, DocumentType<T>, {}> {
        if (populates) {
            [].concat(populates).forEach((item: ModelPopulateOptions) => {
                docsQuery.populate(item);
            });
        }
        return docsQuery;
    }
}
