export const APP_CONFIG = {
    // 网站名字、标题
    name: 'CNode技术社区',
    // 网站关键词
    keywords: 'nodejs, node, express, connect, socket.io',
    // 网站描述
    description: 'CNode：Node.js专业中文社区',
    // logo
    logo: '/public/images/cnodejs_light.svg',
    // icon
    icon: '/public/images/cnode_icon_32.png',
    // 版块
    tabs: [['all', '全部'], ['good', '精华'], ['share', '分享'], ['ask', '问答'], ['job', '招聘'], ['test', '测试']],
    // RSS配置
    rss: {
        title: this.description,
        link: '/',
        language: 'zh-cn',
        description: this.description,
        // 最多获取的RSS Item数量
        max_rss_items: 50,
    },
    // 帖子配置
    topic: {
        // 列表分页20
        list_count: 20,
        // 每天每用户限额计数10
        perDayPerUserLimitCount: 10,
    },
    // 用户配置
    user: {
        // 每个 IP 每天可创建用户数
        create_user_per_ip: 1000,
    },
    // 默认搜索方式
    search: 'baidu', // 'google', 'baidu', 'local'
};