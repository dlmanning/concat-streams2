var Writable = require('stream').Writable
  , util = require('util')
  ;

function ConcatStream (cb, options) {
  if(!(this instanceof ConcatStream)) {
    return new ConcatStream(cb, options);
  }

  var self = this;

  self.cb = cb ? cb : function () {};
  self.options = options ? options : {};

  Writable.call(self, self.options);

  self._body = [];

  self.on('finish', function () {
    if (self.cb) {
      self.cb(self.getBody());
    }
  });
}

util.inherits(ConcatStream, Writable);

ConcatStream.prototype._write = function (chunk, encoding, done) {
  this._body.push(chunk);
  done();
};

ConcatStream.prototype.isArray = function (arr) {
  return Array.isArray(arr);
};

ConcatStream.prototype.arrayConcat = function (arrs) {
  if (arrs.length === 0) {
    return [];
  }
  if (arrs.length === 1) {
    return arrs[0];
  }
  return arrs.reduce(function (a, b) { return a.concat(b); });
};

ConcatStream.prototype.getBody = function () {
  if (this._body.length === 0) {
    return null;
  }

  if (typeof(this._body[0]) === "string") {
    return this._body.join('');
  }

  if (this.isArray(this._body[0])) {
    return this.arrayConcat(this._body);
  }

  if (typeof(Buffer) !== "undefined" && Buffer.isBuffer(this._body[0])) {
    return Buffer.concat(this._body);
  }

  return this._body;
};

module.exports = ConcatStream;