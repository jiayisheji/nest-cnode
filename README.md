# nest-cnode
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

This is using the `Nestjs` imitation [Cnode](https://cnodejs.org).

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
# Auth0
GITHUB_CLIENT_ID=myCoolSecret
GITHUB_CLIENT_SECRET=myCoolClientId
GITHUB_CALLBACK_URL=myCallbackUrl

# Redis Replica Set
REDIS_HOST='127.0.0.1'
REDIS_PORT=6379
REDIS_PASSWORD='123456'
REDIS_DB=0

# MongoDB Replica Set
MONGODB_URL='mongodb://cnode_admin:123456@127.0.0.1:27017/db_cnode'
MONGO_HOST="localhost"
MONGO_PORT=27017
MONGO_USER="cnode_admin"
MONGO_PASS="123456"
MONGO_DBS="cnode"

# Config
SUPER_ADMIN='super_admin'
SESSION_SECRET='cnode'
AUTH_COOKIE_NAME='nest_cnode'

# access qn


````


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
npm run start:prod
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