'use strict';

const _ = require('lodash');

class Timing {
  constructor() {
    this.finished = [];
    this.doing = [];
    this.index = 0;
    this.options = {
      startIndex: 'A',
    };
  }
  start(name) {
    /* istanbul ignore if */
    if (!name) {
      return _.noop;
    }
    const index = this.index;
    const found = _.find(this.doing, item => item.name === name);
    const end = _.once(() => this.end(name));
    /* istanbul ignore if */
    if (found) {
      return end;
    }
    const startItem = {
      index,
      name,
      startedAt: Date.now(),
    };
    this.doing.push(startItem);
    this.index = index + 1;
    _.forEach(this.doing, (item) => {
      if (item.name !== name) {
        if (!item.children) {
          item.children = [];
        }
        item.children.push(startItem);
      }
    });
    return end;
  }
  end(name) {
    if (!name || name === '*') {
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
  remove(name) {
    if (!name) {
      return this;
    }
    _.remove(this.doing, item => item.name === name);
    return this;
  }
  addMetric(name, use) {
    const index = this.index;
    this.finished.push({
      index,
      name,
      use,
    });
    this.index = index + 1;
    return this;
  }
  toJSON(ignoreChildren) {
    const arr = [];
    const keys = ['name', 'startedAt', 'use'];
    _.forEach(this.finished, (item) => {
      const tmp = _.pick(item, keys);
      if (!ignoreChildren && item.children) {
        tmp.children = _.map(item.children, child => child.name);
      }
      arr[item.index] = tmp;
    });
    return _.compact(arr);
  }
  toServerTiming(ignoreChildren) {
    const arr = _.sortBy(this.finished, item => item.index);
    const firstIndex = this.options.startIndex.charCodeAt(0);
    return _.map(arr, (item, index) => {
      let desc = item.name;
      if (!ignoreChildren && item.children) {
        const children = _.map(item.children, child => child.index);
        desc += `(${children.join(' ')})`;
      }
      return `${String.fromCharCode(firstIndex + index)}=${item.use / 1000};"${desc}"`;
    }).join(',');
  }
  setStartIndex(ch) {
    if (!ch) {
      return this;
    }
    this.options.startIndex = `${ch}`;
    return this;
  }
}

module.exports = Timing;
