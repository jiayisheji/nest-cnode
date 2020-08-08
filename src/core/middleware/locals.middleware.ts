import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import * as loader from 'loader';
import * as MarkdownIt from 'markdown-it';
import * as moment from 'moment';
import * as validator from 'validator';
import * as xss from 'xss';
import { ApplicationConfig } from '../config';

moment.locale('zh-cn'); // 使用中文

// Set default options
const md = new MarkdownIt();

md.set({
  html: false, // Enable HTML tags in source
  xhtmlOut: false, // Use '/' to close single tags (<br />)
  breaks: false, // Convert '\n' in paragraphs into <br>
  linkify: true, // Autoconvert URL-like text to links
  typographer: true, // Enable smartypants and other sweet transforms
});

md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx];
  let language = (token.info && 'language-' + token.info) || '';
  language = validator.escape(language);

  return (
    '<pre class="prettyprint ' +
    language +
    '">' +
    '<code>' +
    validator.escape(token.content) +
    '</code>' +
    '</pre>'
  );
};

md.renderer.rules.code_block = (tokens, idx /* , options */) => {
  const token = tokens[idx];

  return (
    '<pre class="prettyprint">' +
    '<code>' +
    validator.escape(token.content) +
    '</code>' +
    '</pre>'
  );
};

const xssConfig = new xss.FilterXSS({
  onIgnoreTagAttr(tag, name, value) {
    // 让 prettyprint 可以工作
    if (tag === 'pre' && name === 'class') {
      return name + '="' + xss.escapeAttrValue(value) + '"';
    }
  },
});

@Injectable()
export class LocalsMiddleware implements NestMiddleware {
  private site_static_host: string;
  private config: ApplicationConfig;
  private mini_assets: boolean;
  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get('application');
    this.mini_assets = this.configService.get<boolean>(
      'environment.mini_assets',
    );
    this.site_static_host =
      this.configService.get<string>('application.site_static_host ') || '';
  }
  use(req: Request, res: Response, next: NextFunction) {
    const tabs = this.config.tabs;
    const site_static_host = this.site_static_host;
    let assets = {};
    if (this.mini_assets) {
      try {
        assets = require('../../../assets.json');
      } catch (e) {
        // tslint:disable-next-line:no-console
        console.error(
          'You must execute `make build` before start app when mini_assets is true.',
        );
        throw e;
      }
    }
    // 应用配置
    res.locals.config = this.config;
    // 加载文件
    res.locals.Loader = loader;
    // 静态资源
    res.locals.assets = assets;
    // 工具助手
    res.locals.helper = {
      // 处理文件路径
      staticFile(filePath: string) {
        // 说明是绝对路径
        if (filePath.startsWith('http') || filePath.startsWith('//')) {
          return filePath;
        }
        return site_static_host + filePath;
      },
      // 代理头像
      proxy(url: string) {
        // 当 google 和 github 封锁严重时，则需要通过服务器代理访问它们的静态资源
        // return '/agent?url=' + encodeURIComponent(url);
        return url;
      },
      // 显示过去xx天xxx小时xx分xxx秒
      ago(date: Date) {
        return moment(date).fromNow();
      },
      // 解析markdown
      markdown(text: string) {
        return (
          '<div class="markdown-text">' +
          xssConfig.process(md.render(text || '')) +
          '</div>'
        );
      },
      // 转换application tabs
      tabName(tab: string) {
        const pair = tabs.find(pair => {
          return pair[0] === tab;
        });
        if (pair) {
          return pair[1];
        }
      },
    };
    next();
  }
}
