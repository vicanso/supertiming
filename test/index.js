'use strict';
const assert = require('assert');
const Timing = require('..');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// eslint-disable-next-line
describe('supertiming', () => {
  // eslint-disable-next-line
  it('get timing json sucessful', (done) => {
    const timing = new Timing();
    timing.once('start', (data) => {
      assert.equal(data.name, '/users/me');
    });
    timing.once('end', (data) => {
      assert.equal(data.name, 'mongodb:get');
    });
    timing.start('/users/me');
    const endGetUser = timing.start('getUser');
    timing.start('mongodb:get', {
      fn: 'find',
    });
    delay(30)
      .then(() => {
        timing.end('mongodb:get', {
          count: 2,
        });
        timing.start('validate:user');
        return delay(50);
      })
      .then(() => {
        timing.end('validate:user');
        return delay(10);
      })
      .then(() => {
        endGetUser();
        timing.end('/users/me');
        timing.addMetric('request-handle', 100);
        const data = timing.toJSON();
        assert.equal(data.length, 5);
        assert.equal(data[0].name, '/users/me');
        assert.equal(data[0].children.join(','), 'getUser,mongodb:get,validate:user');
        assert.equal(data[1].name, 'getUser');
        assert.equal(data[1].children.join(','), 'mongodb:get,validate:user');
        assert.equal(data[2].name, 'mongodb:get');

        assert.equal(data[2].extra.fn, 'find');
        assert.equal(data[2].extra.count, 2);

        assert.equal(data[3].name, 'validate:user');
        assert.equal(data[4].name, 'request-handle');
        done();
      })
      .catch(done);
  });
  // eslint-disable-next-line
  it('get timing json(ignore children) sucessful', (done) => {
    const timing = new Timing();
    timing.start('/users/me');
    timing.start('getUser');
    timing.start('mongodb:get');
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
        const data = timing.toJSON(true);
        assert.equal(data.length, 4);
        assert.equal(data[0].name, '/users/me');
        assert.equal(data[1].name, 'getUser');
        assert.equal(data[2].name, 'mongodb:get');
        assert.equal(data[3].name, 'validate:user');
        done();
      })
      .catch(done);
  });

  // eslint-disable-next-line
  it('remove time record sucessful', (done) => {
    const timing = new Timing();
    timing.start('/users/me');
    timing.start('getUser');
    timing.start('mongodb:get');
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
        timing.remove('getUser');
        timing.end();
        const data = timing.toJSON(true);
        assert.equal(data.length, 3);
        assert.equal(data[0].name, '/users/me');
        assert.equal(data[1].name, 'mongodb:get');
        assert.equal(data[2].name, 'validate:user');
        done();
      })
      .catch(done);
  });

  // eslint-disable-next-line
  it('rename the timing name sucessful', (done) => {
    const timing = new Timing();
    timing.start('/users/me');
    timing.start('getUser');
    timing.start('mongodb:get');
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
        timing.rename('getUser', 'getUserNew');
        timing.end();
        const data = timing.toJSON(true);
        assert.equal(data.length, 4);
        assert.equal(data[0].name, '/users/me');
        assert.equal(data[1].name, 'getUserNew');
        assert.equal(data[2].name, 'mongodb:get');
        assert.equal(data[3].name, 'validate:user');
        done();
      })
      .catch(done);
  });

  // eslint-disable-next-line
  it('get server timing sucessful', (done) => {
    const timing = new Timing();
    timing.start('/users/me');
    timing.start('getUser');
    timing.start('mongodb:get');
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
        const serverTiming = timing.toServerTiming();
        const entries = serverTiming.split(',')
        assert.equal(entries.length, 4);
        entries.forEach((entry) => {
          assert.equal(entry.split('=').length, 3);
          assert.equal(entry.split(';').length, 3);
        })
        done();
      })
      .catch(done);
  });

  // eslint-disable-next-line
  it('get server timing sucessful', (done) => {
    const timing = new Timing();
    timing.start('/users/me');
    timing.start('getUser');
    timing.start('mongodb:get');
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
        const serverTiming = timing.toServerTiming(true);
        assert.equal(serverTiming[0], 'A');
        const entries = serverTiming.split(',')
        assert.equal(entries.length, 4);
        entries.forEach((entry, index) => {
          assert.equal(entry.split('=').length, 3);
          assert.equal(entry.split(';').length, 3);
        })
        done();
      })
      .catch(done);
  });

  // eslint-disable-next-line
  it('get server timing(precision: "ns") successful', (done) => {
    const timing = new Timing({
      precision: 'ns',
    });
    timing.start('/users/me');
    timing.start('getUser');
    timing.start('mongodb:get');
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
        const serverTiming = timing.toServerTiming(true);
        assert.equal(serverTiming[0], 'A');
        const entries = serverTiming.split(',')
        assert.equal(entries.length, 4);
        entries.forEach((entry) => {
          assert.equal(entry.split('=').length, 3);
          assert.equal(entry.split(';').length, 3);
          const timeArr = entry.split(';')[1].split('=');
          assert.equal(timeArr.length, 2);
          assert(parseFloat(timeArr[1]) > 10);
        });
        done();
      })
      .catch(done);
  });

  // eslint-disable-next-line
  it('set server timing start index sucessful', (done) => {
    const timing = new Timing({
      precision: 'ns',
    });
    timing.setStartIndex('a');
    timing.start('/users/me');
    timing.start('getUser');
    timing.start('mongodb:get');
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
        const serverTiming = timing.toServerTiming(true);
        assert.equal(serverTiming[0], 'a');
        const entries = serverTiming.split(',')
        assert.equal(entries.length, 4);
        entries.forEach((entry) => {
          assert.equal(entry.split('=').length, 3);
          assert.equal(entry.split(';').length, 3);
        });

        const timingString = timing.toString();
        assert.equal(timingString.split(' ').length, 4);
        done();
      })
      .catch(done);
  });

  // eslint-disable-next-line
  it('end all timing successful', (done) => {
    const timing = new Timing();
    timing.start('/users/me');
    timing.start('getUser');
    timing.start('mongodb:get');
    delay(30)
      .then(() => {
        timing.end('mongodb:get');
        return delay(50);
      })
      .then(() => {
        timing.end('*');
        const data = timing.toJSON();
        assert.equal(data.length, 3);
        assert.equal(data[0].name, '/users/me');
        assert.equal(data[0].children.join(','), 'getUser,mongodb:get');
        assert.equal(data[1].name, 'getUser');
        assert.equal(data[1].children.join(','), 'mongodb:get');
        assert.equal(data[2].name, 'mongodb:get');
        done();
      })
      .catch(done);
  });
});
