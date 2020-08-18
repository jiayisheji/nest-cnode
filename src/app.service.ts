import {
  CacheStore,
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HomeDto } from './app-home.dto';
import { TopicRepository } from './models';
import moment = require('moment');
import data2xml = require('data2xml');
import xmlbuilder = require('xmlbuilder');
const convert = data2xml();

function utf8ForXml(inputStr: string): string {
  // FIXME: no-control-regex
  /* eslint-disable no-control-regex */
  return inputStr.replace(
    /[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm,
    '',
  );
}

@Injectable()
export class AppService {
  constructor(
    private readonly topicRepository: TopicRepository,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) protected readonly cacheManager: CacheStore,
  ) {}

  async getHome(homeDto: HomeDto): Promise<any> {
    const page = parseInt(homeDto.page, 10) || 1;
    const tab = homeDto.tab || 'all';

    // 取主题
    const query: any = {};
    if (!tab || tab === 'all') {
      query.tab = {
        $nin: ['job', 'dev'],
      };
    } else {
      if (tab === 'good') {
        query.good = true;
      } else {
        query.tab = tab;
      }
    }

    if (!query.good) {
      query.created_at = {
        $gte: moment()
          .subtract(1, 'years')
          .toDate(),
      };
    }

    const limit = this.config.get('application.topic.list_count');
    const options = {
      skip: (page - 1) * limit,
      limit,
      sort: '-top -last_reply_at',
    };
    const topics = await this.topicRepository.getTopicsByQuery(query, options);
    // 取排行榜上的用户
    // let tops = await this.service.cache.get('tops');
    // if (!tops) {
    //   tops = await this.service.user.getUsersByQuery(
    //     { is_block: false },
    //     { limit: 10, sort: '-score' },
    //   );
    //   await this.service.cache.setex('tops', tops, 60);
    // }
    return Promise.resolve({
      current_page: page,
      tabs: this.config.get('application.tabs'),
      tab,
      // pageTitle: tabName && tabName + '版块',
    });
  }

  async rss() {
    const rss = this.config.get('application.rss');

    if (!rss) {
      throw new NotFoundException('Please set `rss` in config');
    }

    // 优先获取缓存
    const rssCache = await this.cacheManager.get('rss');
    if (rssCache) {
      return rssCache;
    }

    const opt = {
      limit: rss.max_rss_items,
      sort: '-created_at',
    };
    const query = { tab: { $nin: ['dev'] } };

    const topics = await this.topicRepository.getTopicsByQuery(query, opt);

    const rss_obj = {
      _attr: { version: '2.0' },
      channel: {
        title: rss.title,
        link: rss.link,
        language: rss.language,
        description: rss.description,
        item: [],
      },
    };

    const link = rss.link;

    topics.forEach(topic => {
      rss_obj.channel.item.push({
        title: topic.title,
        link: link + '/topic/' + topic._id,
        guid: link + '/topic/' + topic._id,
        // description: this.ctx.helper.markdown(topic.content),
        description: topic.content,
        author: topic.author.loginname,
        pubDate: topic.created_at.toUTCString(),
      });
    });

    const rssContent = utf8ForXml(convert('rss', rss_obj));

    // 设置缓存 30分钟
    this.cacheManager.set('rss', rssContent, {
      ttl: 5 * 60,
    });
    return rssContent;
  }

  robots() {
    return `
  # See http://www.robotstxt.org/robotstxt.html for documentation on how to use the robots.txt file
  #
  # To ban all spiders from the entire site uncomment the next two lines:
  # User-Agent: *
  # Disallow: /
`;
  }

  async sitemap() {
    const urlset = xmlbuilder.create('urlset', {
      version: '1.0',
      encoding: 'UTF-8',
    });
    urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

    let sitemapData = await this.cacheManager.get('sitemap');
    if (!sitemapData) {
      const topics = await this.topicRepository.getLimit5w();
      topics.forEach(topic => {
        urlset
          .ele('url')
          .ele(
            'loc',
            `http://${this.config.get('environment.host')}/topic/` + topic._id,
          );
      });
      sitemapData = urlset.end();
      // 缓存一天
      // 设置缓存 30分钟
      await this.cacheManager.set('sitemap', sitemapData, {
        ttl: 3600 * 24,
      });
    }
    return sitemapData;
  }
}
