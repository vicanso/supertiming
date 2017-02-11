# supertiming

Get the function timing log

[![Build Status](https://travis-ci.org/vicanso/supertiming.svg?branch=master)](https://travis-ci.org/vicanso/supertiming)
[![Coverage Status](https://img.shields.io/coveralls/vicanso/supertiming/master.svg?style=flat)](https://coveralls.io/r/vicanso/supertiming?branch=master)
[![npm](http://img.shields.io/npm/v/supertiming.svg?style=flat-square)](https://www.npmjs.org/package/supertiming)
[![Github Releases](https://img.shields.io/npm/dm/supertiming.svg?style=flat-square)](https://github.com/vicanso/supertiming)

## Installation

```js
$ npm install supertiming
```

## API

### start

Set the starting point of timing function, if there is any function is not finished, it will be the child of those functions

- `name` The function name of timing

```js
const Timing = require('supertiming');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const timing = new Timing();
timing.start('GetUserInfo');
delay(10).then(() => {
  timing.start('FindOneById:User');
});
```

### end

Set the ending point of timing function

- `name` The function name to timing, if the name is `*`, end all doing timing

```js
const Timing = require('supertiming');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const timing = new Timing();
timing.start('GetUserInfo');
delay(10).then(() => {
  timing.start('FindOneById:User');
  return delay(40);
}).then(() => {
  timing.end('*');
});
```

### addMetric

Add metric to timing

- `name` The function name of timing

- `use` Cost time of function

```js
const Timing = require('supertiming');
const timing = new Timing();
timing.addMetric('Get-Session', 35);
const data = timing.toJSON();
// [ { name: 'Get-Session', use: 35 } ]
console.info(data);
```

### toJSON

Get tming json format

- `ignoreChildren` ignore the children, default is false

```js
const Timing = require('supertiming');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const timing = new Timing();
timing.start('/users/me');
timing.start('getUser');
timing.start('mongodb:get')
delay(30)
  .then(() => {
    timing.end('mongodb:get');
    timing.start('validate:user');
    return delay(50);
  })
  .then(() => {
    timing.end('validate:user');
    return delay(10);
  })
  .then(() => {
    timing.end('getUser');
    timing.end('/users/me');
    const data = timing.toJSON();
    //[ { name: '/users/me',
    //    startedAt: 1486736323078,
    //    use: 104,
    //    children: [ 'getUser', 'mongodb:get', 'validate:user' ] },
    //  { name: 'getUser',
    //    startedAt: 1486736323078,
    //    use: 104,
    //    children: [ 'mongodb:get', 'validate:user' ] },
    //  { name: 'mongodb:get', startedAt: 1486736323078, use: 37 },
    //  { name: 'validate:user', startedAt: 1486736323116, use: 53 } ]
    console.info(data);
  }).catch(console.error);
```

### toServerTiming

Get server timing for http response

- `ignoreChildren` ignore the children, default is false

```js
const Timing = require('supertiming');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const timing = new Timing();
timing.start('/users/me');
timing.start('getUser');
timing.start('mongodb:get')
delay(30)
  .then(() => {
    timing.end('mongodb:get');
    timing.start('validate:user');
    return delay(50);
  })
  .then(() => {
    timing.end('validate:user');
    return delay(10);
  })
  .then(() => {
    timing.end('getUser');
    timing.end('/users/me');
    const data = timing.toServerTiming();
    // 0=0.097;"/users/me(1 2 3)",1=0.096;"getUser(2 3)",2=0.03;"mongodb:get",3=0.054;"validate:user"
    console.info(data);
  }).catch(console.error);
```

Set http response `Server-Timing` header: `0=0.097;"/users/me(1 2 3)",1=0.096;"getUser(2 3)",2=0.03;"mongodb:get",3=0.054;"validate:user",4=0.12;"Total"`

![](assets/server-timing.png)

## License

MIT
