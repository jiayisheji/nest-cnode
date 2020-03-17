import { registerAs } from '@nestjs/config';
import { ApplicationConfig } from './interfaces';

const name = 'CNode技术社区';
const description = 'CNode：Node.js专业中文社区';

export default registerAs('application', (): ApplicationConfig => ({
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
}));