export interface AppConfig {
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

const name = 'CNode技术社区';
const description = 'CNode：Node.js专业中文社区';

export default {
    name,
    keywords: 'nodejs, node, express, connect, socket.io',
    description,
    logo: '/public/images/cnodejs_light.svg',
    icon: '/public/images/cnode_icon_32.png',
    tabs: [['all', '全部'], ['good', '精华'], ['share', '分享'], ['ask', '问答'], ['job', '招聘'], ['test', '测试']],
    rss: {
        title: name,
        link: '/',
        language: 'zh-cn',
        description,
        max_rss_items: 50,
    },
    topic: {
        list_count: 20,
        perDayPerUserLimitCount: 10,
    },
    user: {
        create_user_per_ip: 1000,
    },
    search: 'baidu',
};