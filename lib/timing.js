'use strict';

const _ = require('lodash');

class Timing {
  constructor() {
    this.finished = [];
    this.doing = [];
    this.index = 0;
  }
  start(name) {
    /* istanbul ignore if */
    if (!name) {
      return this;
    }
    const index = this.index;
    const found = _.find(this.doing, item => item.name === name);
    /* istanbul ignore if */
    if (found) {
      return this;
    }
    const startItem = {
      index,
      name,
      children: [],
      startedAt: Date.now(),
    };
    this.doing.push(startItem);
    this.index = index + 1;
    _.forEach(this.doing, (item) => {
      if (item.name !== name) {
        item.children.push(startItem);
      }
    });
    return this;
  }
  end(name) {
    /* istanbul ignore if */
    if (!name) {
      return this;
    }
    if (name === '*') {
      const now = Date.now();
      _.forEach(this.doing, (item) => {
        /* eslint no-param-reassign:0 */
        item.use = now - item.startedAt;
        this.finished.push(item);
      });
      this.doing = [];
      return this;
    }
    let found;
    const result = [];
    _.forEach(this.doing, (item) => {
      if (item.name === name) {
        found = item;
      } else {
        result.push(item);
      }
    });
    /* istanbul ignore if */
    if (!found) {
      return this;
    }
    found.use = Date.now() - found.startedAt;
    this.doing = result;
    this.finished.push(found);
    return this;
  }
  toJSON(ignoreChildren) {
    const arr = [];
    const keys = ['name', 'startedAt', 'use'];
    _.forEach(this.finished, (item) => {
      const tmp = _.pick(item, keys);
      if (!ignoreChildren && item.children.length) {
        tmp.children = _.map(item.children, child => child.name);
      }
      arr[item.index] = tmp;
    });
    return _.compact(arr);
  }
  toServerTiming(ignoreChildren) {
    const arr = _.sortBy(this.finished, item => item.index);
    return _.map(arr, (item, index) => {
      let desc = item.name;
      if (!ignoreChildren && item.children.length) {
        const children = _.map(item.children, child => child.index);
        desc += `(${children.join(' ')})`;
      }
      return `${index}=${item.use / 1000};"${desc}"`;
    }).join(',');
  }
}

module.exports = Timing;
