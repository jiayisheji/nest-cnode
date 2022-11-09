# Handlebars 快速入门

hbs 是 Express 提供的默认视图引擎，是对 Handlebars 的封装。具体用法参考下面的项目地址，这里额外说明使用 Handlebars 模板引擎及其开发配套的一些插件用法.

Handlebars 使用环境: Node + Express + hbs 后端渲染模式

- **主插件**

  - [Handlebars](https://github.com/wycats/handlebars.js)
  - [hbs](https://github.com/pillarjs/hbs)

- **拓展插件**

  - [handlebars-layouts](https://github.com/shannonmoeller/handlebars-layouts)
  - [handlebars-helpers](https://github.com/helpers/handlebars-helpers)
  - [hbs-utils](https://github.com/dpolivy/hbs-utils)

## Handlebars

Handlebars 是一个 Javascript 模板引擎，能让你轻松高效的编写语义化模板，它是 Mustache 模板引擎的一个扩展，Handlebars 和 Mustache 都是弱逻辑的模板引擎，能将 Web 前端的视图和代码分离，降低两者之间耦合.

Handlebars 以声明式的书写方式定义模板逻辑，一切都是表达式，编写简单易于拓展，可前后端共用。

学习 Handlebars 主要是理解:

- 模板函数: Markup 字符串 = 模板函数 + 数据
- Helper: 逻辑处理/数据过滤/内容转移等，**使用前必须注册**
- Partials: 子模板，**使用前必须注册**
- `{{}}`和`{{{}}}`的区别
- inline helper 和 block helper 的不同写法
- 最终生成的是 Markup HTML 片段字符串
- Helper 定义有先后之分，模板规则类最后定义
- 理解模板中的 this 和路径

## hbs

Express.js view engine for handlebars.js

`hbs`是一个运行在 Express 上，对`Handlebars`模板引擎再次封装的视图引擎。

### 特点

#### 1. registerPartials

`registerPartial`可输入路径注册，对应的方法: `hbs.registerPartials`，会比原始方法更便捷。

#### 2. localsAsTemplateData

可在视图模板中传入 node 环境变量/全局变量

```js
const hbs = require('hbs');
const express = require('express');

const app = express();
hbs.localsAsTemplateData(app);

app.locals.foo = 'bar';
```

```html
top level: {{@foo}}
```

#### 3. handlebars 实例

因为是对 Handlebars 的封装，Handlebars 的实例在这里取到:

```js
// hbs.handlebars is the handlebars module
hbs.handlebars === require('handlebars');
```

### 问题点

#### 1. 如何根据页面插入对应的`style`和`script`

可以使用下面讲到的`handlebars-layouts`处理这个需求，主要是使用 Helper 的特性.

#### 2. 如何更换 layout.hbs 的路径和名称

```js
// view的路径
app.set('views', path.join(__dirname, 'views'));
// 模板后缀
app.set('view engine', 'hbs');
// layout名称
app.set('view options', { layout: 'layout.hbs' });
```

#### 3. 模板加载顺序

1. compile body template(inject all partials and helpers)
2. inject to layout template

## handlebars-layouts

这个插件提供 Handlebars 的基础布局的 helper，包括: extend/embed/content/block 四种子模板嵌套结构，具体来说就是: 继承/嵌套/定义内容及插入方式/插入点。

这四种功能我认为已经能覆盖到所有使用的环境了。

### Helper 介绍

#### 1. extend

Extend Helper 是继承的意思，与 ES6 的 Class Extend 类似，将继承的模板拿来与当前模板整合，Extend 的内容不能包括 HTML 的 tag，只能是各类 Helper.

逻辑思路是这样:

将"layout"子模板拿来，嵌入`content`中定义的内容(根据`content`的名称在"layout"中找到对应的`block`)，之后返回组装好的模板.

例如:

```html
{{#extend "layout"}} {{#content "head" mode="append"}}
<link rel="stylesheet" href="assets/css/home.css" />
{{/content}} {{#content "body"}}
<h2>Welcome Home</h2>
<ul>
  {{#items}}
  <li>{{.}}</li>
  {{/items}}
</ul>
{{/content}} {{#content "foot" mode="prepend"}}
<script src="assets/js/analytics.js"></script>
{{/content}} {{/extend}}
```

#### 2. embed

Embed Helper 是嵌入的意思，将 Embed 模板嵌入当前的子模板中，同样，Embed 的内容不能包括 HTML 的 tag，只能是各类 Helper.

逻辑思路是这样:

将"gallery"子模板拿来，"gallery"中嵌入内部定义的`content`内容，之后将"gallery"整体嵌入当前模板内，之后是继承的操作...

例如:

```html
{{#extend "layout"}} {{#content "body"}} {{#embed "gallery"}} {{#content "body"}}
<img src="1.png" alt="" />
<img src="2.png" alt="" />
{{/content}} {{/embed}} {{#embed "modal" foo="bar" name=user.fullName}} {{#content "title" mode="prepend"}}Image 1 -
{{/content}} {{#content "body"}}<img src="1.png" alt="" />{{/content}} {{/embed}} {{/content}} {{/extend}}
```

#### 3. block

Block Helper 定义一个插入点，插入的内容由 Content Helper 定义。Block Helper 内部可定义一些 HTML Markup.

逻辑思路是这样:

> 类似于 Vue/Angular 的 slot 概念

例如:

```html
{{#block "header"}}
<h1>Hello World</h1>
{{/block}} {{#block "main"}}
<p>Main</p>
{{/block}} {{#block "footer"}}
<p>MIT License</p>
{{/block}}
```

#### 4. content

Content Helper 定义一个插入内容，`mode`可以决定插入的方式，比如: 前插入(prepend)/后插入(append)/替换(replace)。默认是替换(replace)。

例如:

```html
{{#extend "layout"}} {{#content "header"}}
<h1>Hello World</h1>
{{/content}} {{#content "main" mode="append"}}
<p>Main Append</p>
{{/content}} {{#content "footer" mode="prepend"}}
<p>MIT License</p>
{{/content}} {{/extend}}
```

### 安装

```js
const hbs = require('hbs');
const layouts = require('handlebars-layouts');
hbs.registerHelper(layouts(hbs.handlebars));
```

### 问题点

#### 1. `createFrame` 未定义报错

`hbs` 是对`handlebars` 的再次封装，因此 `handlebars-layouts` 初始化使用的 handlebars 实例并不是 `hbs`，因为 `hbs` 中并没有 `createFrame` 方法(`handlebars-layouts`需要这个方法，没有会报错)。

因此，初始化时需要从 hbs 中调用 handlebars 的原始实例(不需要重复引入`handlebars`)

```js
hbs.registerHelper(layouts(hbs.handlebars));
```

#### 2. 子模板未找到

`extend` 和 `embed` 操作的模板都是 `partials`，注意使用前需要 `registerPartials` 注册.

#### 3. hbs 子模板更改页面没生效

`registerPartials` 注册是一次性行为，除非有 watch 文件再次执行注册，或者重启 node 服务，否则 node 中保存的都是第一次的编译结果，关于 watch 的工具会在`hbs-utils`中讲到.

#### 4.`extend`和`embed`书写的 partials 在页面没正常初始化

可能是未正常初始化的 Partials 使用了别的模块注册的 Helper，且这个 Helper 没有在`handlebars-layouts`之前先注册，更改下顺序吧，比如`handlebars-helpers`和`handlebars-layouts`的顺序:

1. handlebars-helpers: 提供基础的 Helper
2. handlebars-layouts: 提供布局的 Helper

## handlebars-helpers

这个是各类 Handlebars 的 Helper 集合，涵盖了全部可能用到的 Helper，不需要自己再实现一遍。具体内容参考[这里](https://github.com/helpers/handlebars-helpers).

> More than 130 Handlebars helpers in ~20 categories.

### 安装

```js
const hbs = require('hbs');
const helpers = require('handlebars-helpers');
helpers({ handlebars: hbs });
```

### 问题点

#### 1. 按照 `handlebars-helpers` 文档安装，Helper 未成功注册

因为这个插件是自动做`registerHelper`注册的，需要使用`hbs`的`registerHelper`的方法完成注册，但是插件默认是使用`handlebars`，因此需要手动传入`hbs`对象:

```js
const helpers = require('handlebars-helpers');
helpers({ handlebars: hbs });
```

可以通过下面的方法查看是否成功注册了 Helper:

```js
console.log(Object.keys(hbs.handlebars.helpers));
```

## hbs-utils

这个工具是在开发时为 hbs 提供`Partials`注册及 watch 的功能。

### 安装

```js
const hbs = require('hbs')
const hbsutils = require('hbs-utils')(hbs)
hbsutils.registerWatchedPartials(config.viewsPath，{
    onchange () {
      // Partials has changed!
      console.log(`Partials has changed!`)
    }
  }，function () {
    // The initial registration of partials is complete.
    console.log(`The initial registration of partials is complete`)
})
```

### 问题点

#### 1. 和 hbs 提供的`registerPartials`之间的区别

主要是提供了 `precompile` 的功能，默认是关闭的的。另外，提供 `name` 属性来修改 `Partials` 的注册名称.

#### 2. `registerWatchedPartials` 之前需要 `registerPartials` 吗

不需要，因为`registerWatchedPartials`会自己按照给定的目录先注册`Partials`，之后再 watch。

#### 3. 如何开启开发模式

提前设好模式，根据下面的判断开启

```js
if (process.env.NODE_ENV === 'development') {
  // ...
} else {
  // ...
}
```

## Handlebars 表达式

### 注意事项

1. `{{}}` 里不能向 `Angular` 和 `Vue` 那样写 js 代码，三目等骚操作。
2. 各种特殊字符也不能写，只能是属性变量名。
3. 变量名不能是模板关键字，比如 `each`，`if`，`extend`，`embed`，`content` 等（如果是关键字需要 this 来访问）。

### 简单的表达式

一般用于变量渲染，输出数据到模板（输出是转义 HTML 标签）

```html
{{variable}} or {{this.variable}}
```

### HTML 转义

一般用于内容渲染，输出非转义的数据到模板（比如：富文本 HTML）

```html
{{{content}}} or {{{this.content}}}
```

> **注意**：Handlebars 不会转义 JavaScript 字串。使用 Handlebars 生成 JavaScript（例如内联事件处理程序），可能会产生跨域脚本攻击漏洞。

### 计算上下文

一般情况下，`Handlebars` 模板会在编译的阶段的时候进行 `context` 传递和赋值。
使用 `with` 的方法，我们可以将 `context` 转移到数据的一个 `section` 里面（如果你的数据包含 section）。
这个方法在操作复杂的 `template` 时候非常有用。

```html
<!-- const data = {
  title: "My first post!",
  author: {
    firstName: "jia",
    lastName: "yi"
  }
} -->

<div class="entry">
  <h1>{{title}}</h1>

  {{#with author}}
  <h2>By {{firstName}} {{lastName}}</h2>
  {{/with}}
</div>
```

> 这个语法和 js 的 [with](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/with) 一样。

### 属性路径

Handlebar 支持路径和 mustache，Handlebar 还支持嵌套的路径，使得能够查找嵌套低于当前上下文的属性
可以通过 `.` 来访问属性，也可以使用 `../` 或 `this/`,来访问父级属性。

```html
<!-- 
  const data = {
    title: "Handlebar",
    url: "https://github.com/jiayisheji/nest-cnode",
    comments: [{id: 1, user: {username: "jiayi"}, comment: "hello"}]
  }
 -->

<h1>title</h1>
<ul>
  {{#each comments}}
  <li><a href="{{..url}}?comments={{id}}">@{{user.username}}：{{comment}}</a></li>
  {{/each}}
</ul>
```

### 模板注释

在 `handlebars` 代码中加注释，就跟在代码中写注释一样。使用 `{{! }}` 或 `{{!-- --}}` 语法。

- 注释将不会出现在结果输出中。如果你想显示注释。只需使用 `html` 注释。它们将被输出。
- 任何包含 `}}` 或其他 `Handlebars` 标记的注释都应该使用 `{{!-- --}}` 语法。

```html
<div class="entry">
  {{! This comment will not be in the output }}
  <!-- This comment will be in the output -->
  {{!-- This comment may contain mustaches like }} --}}
</div>
```

### 代码片段

代码片段通过创建共享模板允许代码复用，可以使用 `Handlebars.registerPartial` 方法进行注册。

使用 `{{>name key=value}}` 方式

- name：使用 `Handlebars.registerPartial` 方法进行注册的名字
- key：传递给共享模板属性名
- value：传递给共享模板属性值

```js
Handlebars.registerPartial('person', '{{person.name}} is {{person.age}} years old.\n');
```

```html
<ul>
  {{#each persons}}
  <li>{{>person person=.}}</li>
  {{/each}}
</ul>
```

## Handlebars 内置助手

### 数据遍历

#### 用 this 来引用遍历的元素，this 指的是数组里的每一项元素

```html
<!-- const list = [1, 2, 3, 4, 5] -->

<ul>
  {{#each list}}
  <li>{{this}}</li>
  {{/each}}
</ul>
```

#### 对象数组可以省略 this

```html
<!-- const list = [{title: '标题1', url: 'http://example.com'},{title: '标题1', url: 'http://example.com'}] -->

<ul>
  {{#each list}}
  <li><a href="{{url}}">{{title}}</a></li>
  {{/each}}
</ul>
```

#### {{else}}

选择性的使用 `else` ，当被循环的是一个空列表的时候会显示其中的内容。

```html
<!-- const list = [] -->

{{#each list}}
<p>{{this}}</p>
{{else}}
<p class="empty">No content</p>
{{/each}}
```

#### 索引值

在使用 `each` 来循环列表的时候，可以使用 `{{@index}}` 来表示当前循环的索引值。

```html
{{#each array}} {{@index}}: {{this}} {{/each}}
```

#### 对象属性

不光可以遍历 `Array`，也可以对于 `Object` 类型的循环，可以使用 `{{@key}}` 来表示。

```html
{{#each object}} {{@key}}: {{this}} {{/each}}
```

### 流程判断

`if` 就像你使用 `javaScript` 一样，指定条件渲染 `DOM`，如果它的参数返回 `false`，`undefined`, `null`, `""` 或者 `[]` （注意：还有 `0`，和 `js` 的 `if` 效果一致）, `Handlebar` 将不会渲染 `DOM`。

```html
<div class="entry">
  {{#if author}}
  <h1>{{firstName}} {{lastName}}</h1>
  {{/if}}
</div>
```

> 如果使用一个空对象 `{}` 作为上下文时，`if` 里内容也不会显示。可以设置 `includeZero=true` 排除 `0` 为 `false`

在使用 `if` 表达式的时候，可以配合 `{{else}}` 来使用，这样当参数返回 `false` 值时，可以渲染 `else` 区块：

```html
<div class="entry">
  {{#if author}}
  <h1>{{firstName}} {{lastName}}</h1>
  {{else}}
  <h1>Unknown Author</h1>
  {{/if}}
</div>
```

支持 `if-else if-else` 写法，这里有个缺点，需要自己实现一个 `isEqual` Helper 方法，也可以借助 `handlebars-helpers` 提供的 `eq` Helper 方法, **注意**：`eq` 既是 `Helper` 也是 `Partials`。

Helper

```js
Handlebars.registerHelper('isEqual', (value1, value2, options) => {
  return value1 === value2;
});
```

Template

```html
<div>{{#if (isEqual value 'a')}} A {{else if (isEqual value 'b')}} B {{else}} C {{/if}}</div>
```

不支持 `switch-case` 语法，如果想要使用可以自己简单定制：

Helper

```js
Handlebars.registerHelper('switch', function (value, options) {
  this.switch_value = value;
  return options.fn(this);
});

Handlebars.registerHelper('case', function (value, options) {
  if (value == this.switch_value) {
    return options.fn(this);
  }
});

Handlebars.registerHelper('default', function (value, options) {
  return true;
});
```

Template

```html
<div>{{#switch 'a'}} {{#case 'a'}} A {{/case}} {{#case 'b'}} B {{/case}} {{#default}} D {{/default}} {{/switch}}</div>
```

> 具体可以参考 [https://github.com/handlebars-lang/handlebars.js/issues/927](https://github.com/handlebars-lang/handlebars.js/issues/927) 实现

`unless` 和 `if`　是正好相反的，当表达式返回假值时就会渲染其内容：

```html
<div class="entry">
  {{#unless license}}
  <h3 class="warning">WARNING: This entry does not have a license!</h3>
  {{/unless}}
</div>
```

## 总结

以上是使用 `Handlebars` 时的最佳实践和插件组合，希望能对你有用。
