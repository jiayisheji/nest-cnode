<div id="top"></div>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

[![Angular][angular-shield]][angular-url]
[![NestJs][nestjs-shield]][nestjs-url]
[![NodeJs][nodejs-shield]][nodejs-url]
[![Typescript][typescript-shield]][typescript-url]
[![MongoDB][mongodb-shield]][mongodb-url]
[![JWT][jwt-shield]][jwt-url]
[![Jest][jest-shield]][jest-url]
[![Docker][docker-shield]][docker-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://nx.dev/" target="blank"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="450"></a>

  <p style="text-align: center;"></p>

  <h3 align="center">CNode NestJs Boilerplate 🚀🚀🚀 </h3>

  <p align="center">
 Boilerplate with <a href="https://github.com/Automattic/mongoose"><strong>Mongoose</strong></a> and <a href="https://github.com/mongodb/mongo"><strong>MongoDB</strong></a> as Database.
 <br />
 Made with following <a href="https://github.com/cnodejs/nodeclub/"><strong>Nodeclub</strong></a> as benchmark and NestJs Habit.
    <br />
    <br />
    <a href="https://github.com/jiayisheji/nest-cnode/docs"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/jiayisheji/nest-cnode">View Source</a>
    ·
    <a href="https://github.com/jiayisheji/nest-cnode/issues">Report Bug</a>
    ·
    <a href="https://github.com/jiayisheji/nest-cnode/issues">Request Feature</a>
  </p>
</div>

<br />

## Description

[CNode](https://cnodejs.org) is a [Nestjs](https://github.com/nestjs/nest) boilerplate 🚀. A nestjs+hbs+webpack demo for server side renderer. A simple application demonstrating [Angular](https://github.com/angular/angular) the basic usage of dashboard with [NestJS](https://github.com/nestjs/nest) (JWT, Passport, Github, User, Role, Permission) based on [ngx-admin](https://github.com/akveo/ngx-admin) template.

## Build with

Describes which version of the main packages and main tools.

| Name | Version |
| --- | --- |
| Nx | v15.x |
| Angular | v14.x |
| NestJs | v9.x |
| NodeJs | v14.x |
| Typescript | v4.x |
| Mongoose | v6.x |
| MongoDB | v5.x |
| NPM | v6.x |
| Docker | v20.x |
| Docker Compose | v2.x |

## Prerequisites

We assume that all people are coming to here is `Programmer with intermediate knowledge` and also we need to understanding more knowledge before we start to reduce knowledge gaps.

- Understood [ExpressJs Fundamental][expressjs-url], NodeJs Base Framework. It will help we to understand how the NestJs works.
- Understood [Typescript Fundamental][typescript-url], Programming Language. It will help we to write and read the code.
- Understood [NestJs Fundamental][nestjs-url], Main Framework. NodeJs Framework with support fully TypeScript.
- Understood [Angular Fundamental][angular-url], Main Framework. Javascript Framework with support fully TypeScript.
- Understand what is and how NoSql works as a Database, specially [MongoDB](#acknowledgements).

## Features

With this sample, you can:

- Understand basic use of Nestjs, and store data with mongodb and redis
- Use Nestjs with passport for authentication and third-party login Github

## Getting Start

Before we start, we need to install:

- [nodejs](http://nodejs.cn/)
- [mongodb](https://www.mongodb.com/)
- [redis](https://redis.io/)

See their official document.

> Make sure we don't get any error after installation

Open our terminal and follow this instruction

1. Check NodeJs is successful installed in our OS.

```sh
node --version

# will return
# v14.15.0
```

2. Check package manager is running, with yarn

```sh
npm --version

# will return
# 6.14.8
```

3. Check MongoDB

```sh
mongod --version

# will return
# db version v5.0.4
```

> Using [Docker](#Run-with-Docker) to install MongoDB is recommended

### Clone this repository locally

```sh
git clone https://github.com/jiayisheji/nest-cnode.git
```

### Installation

1. Install dependencies

```sh
npm install
```

2. Build our Env based on `.env.example` file.

You also need to set the env config.

```sh
cp .env.example .env
```

For that, if you just create a file named `.env` in the directory and set the values like the following, the app will just work:

```bash
// null
```

### Run project

1. running CNode client

```sh
npm run start client
```

2. running CNode server and dashboard

```sh
npm run start server
&&
npm run start admin
```

Cheers 🍻🍻 !!! our project is running well. Now we can use all features.

### Test

1. running CNode client

```sh
npm run test client
```

2. running CNode server and dashboard

```sh
npm run test server
&&
npm run test admin
&&
npm run test admin-e2e
```

### Run with Docker

1. We need to install `docker` and `docker compose`.

- Docker official Documentation, [here][docker-url]
- Docker Compose official Documentation, [here][docker-compose-url]

2. Check `docker` is running or not

```sh
docker --version

# will return
# Docker version 20.10.11, build dea9396
```

and check `docker-compose`

```sh
docker-compose --version

# will return
# docker-compose version 1.29.2, build 5becea4c
```

3. Run docker compose

```sh
docker-compose up -d
```

## Reference

1. Awesome Nest

- [https://github.com/juliandavidmr/awesome-nest](https://github.com/juliandavidmr/awesome-nest)

2. NestJS Samples

- [https://github.com/nestjs/nest/tree/master/sample](https://github.com/nestjs/nest/tree/master/sample)

3. Awesome Angular

- [https://github.com/PatrickJS/awesome-angular](https://github.com/PatrickJS/awesome-angular)

4. Awesome Nx

- [https://github.com/nrwl/nx-examples](https://github.com/nrwl/nx-examples)

<br />
<p align="right"><a href="#top">back to top</a></p>

<!-- BADGE LINKS -->

[contributors-shield]: https://img.shields.io/github/contributors/jiayisheji/nest-cnode?style=for-the-badge
[forks-shield]: https://img.shields.io/github/forks/jiayisheji/nest-cnode?style=for-the-badge
[stars-shield]: https://img.shields.io/github/stars/jiayisheji/nest-cnode?style=for-the-badge
[issues-shield]: https://img.shields.io/github/issues/jiayisheji/nest-cnode?style=for-the-badge
[license-shield]: https://img.shields.io/github/license/jiayisheji/nest-cnode?style=for-the-badge
[github-shield]: https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white
[typescript-shield]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[mongodb-shield]: https://img.shields.io/badge/MongoDB-white?style=for-the-badge&logo=mongodb&logoColor=4EA94B
[nodejs-shield]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[jwt-shield]: https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white
[aws-shield]: https://img.shields.io/badge/Amazon_AWS-{232F3E}?style=for-the-badge&logo=amazonaws&logoColor=white
[kafka-shield]: https://img.shields.io/badge/kafka-0000?style=for-the-badge&logo=apachekafka&logoColor=black&color=white
[jest-shield]: https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white
[docker-shield]: https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white
[nestjs-shield]: https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white
[yarn-shield]: https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white
[angular-shield]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white

<!-- GITHUB LINKS -->

[repo-url]: https://github.com/jiayisheji/nest-cnode
[license-url]: https://github.com/jiayisheji/nest-cnode/blob/main/LICENSE.md
[issues-url]: https://github.com/jiayisheji/nest-cnode/issues
[stars-url]: https://github.com/jiayisheji/nest-cnode/stargazers
[forks-url]: https://github.com/jiayisheji/nest-cnode/network/members
[contributors-url]: https://github.com/jiayisheji/nest-cnode/graphs/contributors
[history-url]: https://github.com/jiayisheji/nest-cnode/commits/main

<!-- NESTJS LINKS -->

[nestjs-url]: http://nestjs.com/
[nestjs-fundamental-url]: http://nestjs.com/

<!-- ANGULAR LINKS -->

[angular-url]: https://angular.io/
[angular-fundamental-url]: https://angular.io/

<!-- OTHER LINKS -->

[nodejs-url]: https://nodejs.org/
[bcrypt-url]: https://www.npmjs.com/package/bcrypt
[expressjs-url]: https://expressjs.com
[mongoose-url]: https://mongoosejs.com/
[mongodb-url]: https://docs.mongodb.com/
[passport-url]: https://github.com/jaredhanson/passport
[class-transformer-url]: https://github.com/typestack/class-transformer
[class-validation-url]: https://github.com/typestack/class-validator
[yarn-url]: https://yarnpkg.com
[typescript-url]: https://www.typescriptlang.org/
[jwt-url]: https://jwt.io
[mongodb-create-database-url]: https://www.mongodb.com/basics/create-database
[kafka-url]: https://kafka.apache.org/quickstart
[jest-url]: https://jestjs.io/docs/getting-started
[husky-url]: https://docs.nestjs.com/microservices/kafka
[docker-url]: https://docs.docker.com
[docker-compose-url]: https://docs.docker.com/compose/
