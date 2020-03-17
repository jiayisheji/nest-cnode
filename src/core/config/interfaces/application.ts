export interface ApplicationConfig {
    // 网站名字、标题
    name: string;
    // 网站关键词
    keywords: string;
    // 网站描述
    description: string;
    // logo
    logo: string;
    // icon
    icon: string;
    // 版块
    tabs: [string, string][];
    // RSS配置
    rss: {
        title: string;
        link: string;
        language: string;
        description: string;
        // 最多获取的RSS Item数量
        max_rss_items: number;
    };
    // 帖子配置
    topic: {
        // 列表分页20
        list_count: number;
        // 每天每用户限额计数10
        perDayPerUserLimitCount: number;
    };
    // 用户配置
    user: {
        // 每个 IP 每天可创建用户数
        create_user_per_ip: number;
    };
    // 默认搜索方式
    search: 'google' | 'baidu' | 'local';
}