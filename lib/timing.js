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
  toJSON() {
    const arr = [];
    const keys = ['name', 'startedAt', 'use'];
    _.forEach(this.finished, (item) => {
      const tmp = _.pick(item, keys);
      if (item.children.length) {
        tmp.children = _.map(item.children, child => child.name);
      }
      arr[item.index] = tmp;
    });
    return _.compact(arr);
  }
  toServerTiming() {
    const arr = _.sortBy(this.finished, item => item.index);
    return _.map(arr, (item, index) => {
      let desc = item.name;
      if (item.children.length) {
        const children = _.map(item.children, child => child.index);
        desc += `(${children.join(' ')})`;
      }
      return `${index}=${item.use / 1000};"${desc}"`;
    }).join(',');
  }
  // sql-1=0.1;"MySQL",sql-2=0.9;"BADE"
}

module.exports = Timing;
