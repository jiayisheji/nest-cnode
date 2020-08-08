import { DocumentType } from '@typegoose/typegoose';
import {
  Document,
  ModelPopulateOptions,
  QueryFindOneAndRemoveOptions,
  QueryFindOneAndUpdateOptions,
  Types,
} from 'mongoose';

export type DocumentPartial<T> = ModelPartial<T> | DocumentType<T> | Document;

/**
 * 将T中的所有属性设为可选
 */
export type ModelPartial<T> = {
  [P in keyof T]?: T[P] extends Types.ObjectId ? string : T[P];
};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

/**
 * 将T中的所有属性设为可选
 */
export type QueryPartialEntity<T> = {
  [P in keyof T]?: T[P] extends Types.ObjectId ? string : T[P];
};

/**
 * 让T中的所有属性都是可选的。深的版本。
 */
export type QueryDeepPartialEntity<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<QueryDeepPartialEntity<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<QueryDeepPartialEntity<U>>
    : T[P] extends Types.ObjectId
    ? string
    : QueryDeepPartialEntity<T[P]>;
};

/**
 * 用于查找操作
 */
export type FindConditions<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<FindConditions<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<FindConditions<U>>
    : T[P] extends Types.ObjectId
    ? string | Types.ObjectId
    : FindConditions<T[P]>;
};

export interface FindOneOptions<T> {
  lean?: boolean;
  populate?: ModelPopulateOptions | ModelPopulateOptions[];
  projection?: Projection<T>;
}

export interface FindManyOptions<T> extends FindOneOptions<T> {
  sort?: OrderByCondition<T>;
  limit?: number;
  skip?: number;
  batchSize?: number;
  tailable?: {
    bool?: boolean;
    opts?: {
      numberOfRetries?: number;
      tailableRetryInterval?: number;
    };
  };
  maxscan?: number;
  comment?: string;
  snapshot?: boolean;
  readPreference?: {
    pref: string;
    tags?: T[];
  };
  hint?: T;
}

/**
 * 指定要包含或排除哪些 document字段(也称为查询“投影”)。
 * 在 mongoose 中有两种指定方式，字符串指定和对象形式指定。
 * 1. 字符串指定时在排除的字段前加 `-` 号，只写字段名的是包含。
 * 2. 对象形式指定时，`1` 是包含，`0` 是排除。
 */
export type Projection<T> =
  | {
      [P in keyof T]?: number;
    }
  | string;

/**
 * 排序
 * 'asc' | 'desc' | 'ascending' | 'descending' | 1 | -1
 */
export type OrderByCondition<T> =
  | {
      [P in keyof T]?: 'asc' | 'desc' | 'ascending' | 'descending' | number;
    }
  | string;

export interface Repository<Entity> {
  /**
   * 比较给定实体的主键属性和传递id是否匹配。
   * @param entity
   * @param id
   */
  equalsId(entity: Entity, id: string | Types.ObjectId): Promise<boolean>;

  /**
   * 创建一个新的模型实例。
   */
  create(): Entity;

  /**
   * 保存给定的实体或实体数组。
   * 如果该实体已经存在于数据库中，则会对其进行更新。
   * 如果该实体在数据库中不存在，则将其插入。
   */
  save(entity: Entity | QueryDeepPartialEntity<Entity>): Entity;

  /**
   * 查找与给定选项匹配的实体
   * @param conditions 给定条件
   * @param projection 查询“投影” 参考 `Query.prototype.select()`。
   * @param options 配置 参考 `Query.prototype.setOptions()`
   */
  find(
    conditions: FindConditions<Entity>,
    projection: Projection<Entity>,
    options: FindManyOptions<Entity>,
  ): Promise<Entity[]>;

  /**
   * 查找与某些ID或查找选项匹配的第一个实体
   * @param conditions 给定条件 可以是字符串id 也可以是ObjectId 也可以是匹配选项
   * @param projection 查询“投影”，参考 `Query.prototype.select()`。
   * @param options 配置 参考 `Query.prototype.setOptions()`
   */
  findOne(
    conditions: string | Types.ObjectId | FindConditions<Entity>,
    projection: Projection<Entity>,
    options: FindOneOptions<Entity>,
  ): Promise<Entity | null>;

  /**
   * 查找与给定查找选项匹配的实体。
   * 还计算符合给定条件但忽略分页设置（`skip` 和 `take`选项）的所有实体。
   * @param conditions
   * @param projection
   * @param options
   */
  findAndCount(
    conditions: FindConditions<Entity>,
    projection: Projection<Entity>,
    options: FindManyOptions<Entity>,
  ): Promise<[Entity[], number]>;

  /**
   * 计算与给定选项匹配的实体数量。对分页有用。
   * @param conditions 给定条件
   */
  count(conditions: FindConditions<Entity>): Promise<number>;

  /**
   * 通过给定的更新选项或实体ID部分更新实体。
   * @param conditions 给定条件
   */
  /**
   * 通过给定的更新选项或实体ID部分更新实体。
   * @param conditions 给定条件
   * @param partialEntity 更新实体内容
   * @param options 配置 参考 `Query.prototype.setOptions()`
   */
  update(
    conditions: string | Types.ObjectId | FindConditions<Entity>,
    partialEntity: QueryDeepPartialEntity<Entity>,
    options: QueryFindOneAndUpdateOptions,
  ): void;

  /**
   * 按实体id或给定条件删除实体
   * 物理删除
   * `Delete`意味着擦除(即呈现为不存在或不可恢复)
   */
  delete(
    conditions: FindConditions<Entity>,
    options?: QueryFindOneAndRemoveOptions,
  ): void;

  /**
   * 按实体id或给定条件删除实体(通常说的软删除)
   * 逻辑删除 标记deleted字段
   * `Remove`则表示删除并留出(但保持存在)
   * @param conditions 给定条件
   * @param deletedPath deleted字段映射
   */
  remove(conditions: FindConditions<Entity>, deletedPath?: string): void;

  /**
   * 按实体id或给定条件恢复软删除的实体
   * @param conditions 给定条件
   * @param deletedPath deleted字段映射
   */
  recover(conditions: FindConditions<Entity>, deletedPath?: string): void;

  /**
   * 清除给定表中的所有数据（将其截断/删除）
   */
  clear(): void;

  /**
   *
   */
  /**
   * 根据提供的与给定选项匹配的实体的值来递增某个字段
   * @param conditions 给定条件
   * @param propertyPath 要递增字段
   * @param value 递增值 默认`1`
   */
  increment(
    conditions: FindConditions<Entity>,
    propertyPath: string,
    value?: number,
  ): void;

  /**
   * 根据提供的与给定选项匹配的值递减某个字段
   * @param conditions 给定条件
   * @param propertyPath 要递减字段
   * @param value 递减值 默认`1`
   */
  decrement(
    conditions: FindConditions<Entity>,
    propertyPath: string,
    value?: number,
  ): void;
}
