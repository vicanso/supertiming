'use strict';
const assert = require('assert');
const Timing = require('..');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


describe('supertiming', () => {
  it('get timing json sucessful', (done) => {
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
        timing.addMetric('request-handle', 100);
        const data = timing.toJSON();
        assert.equal(data.length, 5);
        assert.equal(data[0].name, '/users/me');
        assert.equal(data[0].children.join(','), 'getUser,mongodb:get,validate:user');
        assert.equal(data[1].name, 'getUser');
        assert.equal(data[1].children.join(','), 'mongodb:get,validate:user');
        assert.equal(data[2].name, 'mongodb:get');
        assert.equal(data[3].name, 'validate:user');
        assert.equal(data[4].name, 'request-handle');
        done();
      })
      .catch(done);
  });

  it('get timing json(ignore children) sucessful', (done) => {
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

  it('get server timing sucessful', (done) => {
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
        const serverTiming = timing.toServerTiming();
        assert.equal(serverTiming.split(',').length, 4);
        assert.equal(serverTiming.split('=').length, 5);
        assert.equal(serverTiming.split(';').length, 5);
        done();
      })
      .catch(done);
  });

  it('get server timing sucessful', (done) => {
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
        const serverTiming = timing.toServerTiming(true);
        assert.equal(serverTiming.split(',').length, 4);
        assert.equal(serverTiming.split('=').length, 5);
        assert.equal(serverTiming.split(';').length, 5);
        done();
      })
      .catch(done);
  });

  it('end all timing successful', (done) => {
    const timing = new Timing();
    timing.start('/users/me');
    timing.start('getUser');
    timing.start('mongodb:get')
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
      }).catch(done);
  });
});
