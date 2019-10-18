import { BaseInterface } from '../base.interface';
import { Types } from 'mongoose';

export interface Topic extends BaseInterface {
    /**
     * 标题
     */
    title: string;
    /**
     * 内容
     */
    content: string;
    /**
     * 作者关联id
     */
    author_id: Types.ObjectId;
    /**
     * 置顶帖
     */
    top: boolean;
    /**
     * 精华帖
     */
    good: boolean;
    /**
     * 被锁定主题
     */
    lock: boolean;
    /**
     * 回复数
     */
    reply_count: number;
    /**
     * 访问数
     */
    visit_count: number;
    /**
     * 收藏数
     */
    collect_count: number;
    /**
     * 创建时间
     */
    create_at: Date;
    /**
    * 更新时间
    */
    update_at: Date;
    /**
     * 最近回复者id
     */
    last_reply: Types.ObjectId;
    /**
     * 最近回复时间
     */
    last_reply_at: Date;
    /**
     * 内容是否html格式
     */
    content_is_html: boolean;
    /**
     * 分类
     */
    tab: string;
    /**
     * 是否删除 软删除
     */
    deleted: boolean;
}