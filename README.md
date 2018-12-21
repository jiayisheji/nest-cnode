# nest-cnode
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

This is using the [Nestjs](https://github.com/nestjs/nest) imitation [Cnode](https://cnodejs.org).

## Installation

Currently runs with:

- nodejs v8.11.1
- mongodb v3.4.1
- redis v3.2.1
- nestjs v5.1.0
- express v4.16.3

With this sample, you can :

- Understand basic use of Nestjs, and store data with mongodb and redis
- Use Nestjs with passport for authentication and third-party login Github

## Getting Started

Environment Dependencies:

- [nodejs](http://nodejs.cn/)
- [mongodb](https://www.mongodb.com/)
- [redis](https://redis.io/)

Clone this repository locally :

``` bash
git clone https://github.com/jiayisheji/nest-cnode.git
```

Install dependencies with npm :

``` bash
npm install
```

## Set up `.env` file

You also need to set the env config.

For that, if you just create a file named .env in the directory and set the values like the following, the app will just work:

.env file

````bash
#
# config
#
HOST='localhost'
PORT=3000
STATIC_HOST=''
MINI_ASSETS=false

#
# system
#
SUPER_ADMIN='super_admin'
SESSION_SECRET='cnode'
AUTH_COOKIE_NAME='nest_cnode'
GITHUB_CLIENT_ID=myCoolClientId
GITHUB_CLIENT_SECRET=myCoolSecret

#
# access qn
#
QN_ACCESS_KEY='your access key'
QN_SECRET_KEY='your secret key'
QN_BUCKET='your bucket name'
# 如果vps在国外，请使用 http://up.qiniug.com/ ，这是七牛的国际节点
# 如果在国内，此项请留空
QN_UPLOAD_URL=''

#
# mail
#
MAIL_HOST='smtp.126.com'
MAIL_PORT=25
MAIL_USER='club@126.com'
MAIL_PASS='club'

#
# database redis
#
# Redis Replica Set
REDIS_HOST='127.0.0.1'
REDIS_PORT=6379
REDIS_PASSWORD=''
REDIS_DB=0

#
# database mongoDB
#
# MongoDB Replica Set
MONGO_HOST="localhost"
MONGO_PORT=27017
MONGO_USER="cnode_admin"
MONGO_PASS="123456"
MONGO_DBS="db_cnode"
````

## Running the app

```bash
# development
$ npm run start

# watch development mode
$ npm run start:dev

# production mode
 npm run prestart:prod && npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Dependencies

Dependencies are managed through package.json. In that file you'll find two sections:

### dependencies

Package | Description
---|---
bcryptjs | Library for hashing and salting user passwords
dotenv | Loads environment variables from .env file
ejs-mate | Ejs template engine for Express
ioredis | Redis ODM
mongoose | MongoDB ODM
nodemailer | Node.js library for sending emails
passport | Simple and elegant authentication library for node.js
passport-local | Sign-in with Username and Password plugin
passport-github | Sign-in with Github plugin
typescript | JavaScript compiler/type checker that boosts JavaScript productivity

### devDependencies

Package | Description
---|---
@types | Dependencies in this folder are .d.ts files used to provide types
cross-env | Cross platform setting of environment scripts
jest | Testing library for JavaScript
nodemon | Utility that automatically restarts node process when it crashes
supertest | HTTP assertion library
ts-jest | A preprocessor with sourcemap support to help use TypeScript wit Jest
ts-node | Enables directly running TS files. Used to run copy-static-assets.ts
tslint | Linter (similar to ESLint) for TypeScript files

## Reference

1. Awesome Nest
 - [https://github.com/juliandavidmr/awesome-nest](https://github.com/juliandavidmr/awesome-nest)
2. NestJS Samples
 - [https://github.com/nestjs/nest/tree/master/sample](https://github.com/nestjs/nest/tree/master/sample)

 