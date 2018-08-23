import { BaseInterface } from '../base.interface';

export interface User extends BaseInterface {
    name: string;  // 显示名字
    loginname: string;  // 登录名
    pass: string; // 密码
    age: number;  // 年龄
    email: string;  // 邮箱
    active: boolean;  // 是否激活
    collect_topic_count: number;  // 收集话题数
    topic_count: number;  // 发布话题数
    score: number;   // 积分
    is_star: boolean;  //
    is_block: boolean; // 是否黑名单
    url: string; // 个人主页
    location: string; // 位置
    profile_image_url: string;
    signature: string; // 签名
    profile: string; // 描述
    weibo: string; // 微博地址
    avatar: string; // 头像地址
    githubId: string; // github id 绑定github获取的
    githubUsername: string; // github 用户名 绑定github获取的
    githubAccessToken: string; // github AccessToken 绑定github获取的
    reply_count: number; // 回复数
    follower_count: number; // 粉丝
    following_count: number; // 关注
    collect_tag_count: number; // 收集标签数
    level: string; // 等级
    receive_reply_mail: boolean; // 收到回复邮件
    receive_at_mail: boolean;  // 收到的邮件
    from_wp: boolean; // 来源
    retrieve_time: number; // 检索时间
    retrieve_key: string; // 检索key
    accessToken: string;  // AccessToken
    is_admin?: boolean;   // 是否是管理员
    avatar_url?: string;  // 头像地址
    isAdvanced?: boolean;  // 是否高级用户
}