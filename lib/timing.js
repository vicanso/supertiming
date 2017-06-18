'use strict';

const nano = require('nano-seconds');

function once(fn, context) {
  let result;
  return function doOnce() {
    if (fn) {
      /* eslint prefer-rest-params:0 */
      result = fn.apply(context || this, arguments);
      fn = null;
    }
    return result;
  };
}

function noop() {}

class Timing {
  constructor(options) {
    this.finished = [];
    this.doing = [];
    this.index = 0;
    this.options = Object.assign({
      startIndex: 'A',
      precision: 'ms',
    }, options);
  }
  /**
   * Get the time of now
   *
   * @returns {Number|Array}
   *
   * @memberOf Timing
   */
  now() {
    const precision = this.options.precision;
    if (precision === 'ns') {
      return nano.now();
    }
    return Date.now();
  }
  /**
   * Get the use time
   *
   * @param {Number|Array} start The start time
   * @returns {Number}
   *
   * @memberOf Timing
   */
  use(start) {
    const precision = this.options.precision;
    if (precision === 'ns') {
      return nano.difference(start);
    }
    return Date.now() - start;
  }
  /**
   * Set the start timing
   *
   * @param {String} name The timing name
   * @returns {Function} The end function of this timing
   *
   * @memberOf Timing
   */
  start(name) {
    /* istanbul ignore if */
    if (!name) {
      return noop;
    }
    const index = this.index;
    const found = this.doing.find(item => item.name === name);
    const end = once(() => this.end(name));
    /* istanbul ignore if */
    if (found) {
      return end;
    }
    const startItem = {
      index,
      name,
      startedAt: this.now(),
    };
    this.doing.push(startItem);
    this.index = index + 1;
    this.doing.forEach((item) => {
      if (item.name !== name) {
        if (!item.children) {
          item.children = [];
        }
        item.children.push(startItem);
      }
    });
    return end;
  }
  /**
   * Set the end of timing
   *
   * @param {String} name The timing name
   * @returns {Integer} The use time of name, if not found, it will return -1
   *
   * @memberOf Timing
   */
  end(name) {
    if (!name || name === '*') {
      this.doing.forEach((item) => {
        /* eslint no-param-reassign:0 */
        item.use = this.use(item.startedAt);
        this.finished.push(item);
      });
      this.doing = [];
      return this;
    }
    let found;
    const result = [];
    this.doing.forEach((item) => {
      if (item.name === name) {
        found = item;
      } else {
        result.push(item);
      }
    });
    /* istanbul ignore if */
    if (!found) {
      return -1;
    }
    found.use = this.use(found.startedAt);
    this.doing = result;
    this.finished.push(found);
    return found.use;
  }
  /**
   * Remove the timing
   *
   * @param {String} name The timing name
   * @returns {Timing}
   *
   * @memberOf Timing
   */
  remove(name) {
    if (!name) {
      return this;
    }
    this.doing = this.doing.filter(item => item.name !== name);
    return this;
  }
  /**
   * Rename the timing name
   *
   * @param {String} name The current timing name
   * @param {String} newName The new name for timing
   * @returns {Timing}
   *
   * @memberOf Timing
   */
  rename(name, newName) {
    if (!name || !newName) {
      return this;
    }
    const found = this.doing.find(item => item.name === name);
    if (found) {
      found.name = newName;
    }
    return this;
  }
  /**
   * Add metric for the timing
   *
   * @param {String} name The timing name
   * @param {Number} use The use time
   * @returns {Timing}
   *
   * @memberOf Timing
   */
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
  /**
   * To json
   *
   * @param {Boolean} ignoreChildren  Ignore the children timing
   * @returns {Array}
   *
   * @memberOf Timing
   */
  toJSON(ignoreChildren) {
    const arr = [];
    this.finished.forEach((item) => {
      const tmp = {
        name: item.name,
        startedAt: item.startedAt,
        use: item.use,
      };
      if (!ignoreChildren && item.children) {
        tmp.children = item.children.map(child => child.name);
      }
      arr[item.index] = tmp;
    });
    return arr.filter(item => !!item);
  }
  /**
   * To string
   *
   * @param {Boolean} ignoreChildren  Ignore the children timing
   * @returns {Array}
   *
   * @memberOf Timing
   */
  toString(ignoreChildren) {
    const precision = this.options.precision;
    const arr = this.toJSON(ignoreChildren);
    return arr.map((item) => {
      let str = item.name;
      if (item.children && item.children.length) {
        str += `[${item.children.join(',')}]`;
      }
      str += `[${item.use}${precision}]`;
      return str;
    }).join(' ');
  }
  /**
   * To server timing
   *
   * @param {Boolean} ignoreChildren  Ignore the children timing
   * @returns {String}
   *
   * @memberOf Timing
   */
  toServerTiming(ignoreChildren) {
    const precision = this.options.precision;
    const arr = this.finished.slice(0).sort((a, b) => a.index - b.index);
    const firstIndex = this.options.startIndex.charCodeAt(0);
    return arr.map((item, index) => {
      let desc = item.name;
      if (!ignoreChildren && item.children) {
        const children = item.children.map(child => child.index);
        desc += `(${children.join(' ')})`;
      }
      let use = item.use;
      if (precision === 'ns') {
        use /= 1000000;
      }
      return `${String.fromCharCode(firstIndex + index)}=${use};"${desc}"`;
    }).join(',');
  }
  /**
   * Set the start index for server timing
   *
   * @param {String} ch The start index
   * @returns {Timing}
   *
   * @memberOf Timing
   */
  setStartIndex(ch) {
    if (!ch) {
      return this;
    }
    this.options.startIndex = `${ch}`;
    return this;
  }
}

module.exports = Timing;
