
const util = require('util');
const Writable = require('stream').Writable;

function OutgoingResponse(req) {
  Writable.call(this);

  this.socket = req.socket;
  this._headers = {};

  this.finished = false;
}
util.inherits(OutgoingResponse, Writable);

OutgoingResponse.prototype.setHeader = function (name, value) {
  // TODO check name and value 
  var key = name.toLowerCase();
  this._headers[key] = value;
}

OutgoingResponse.prototype.getHeader = function (name) {
  if (arguments.length < 1) {
    throw new Error('"name" argument is required for getHeader(name)');
  }

  var key = name.toLowerCase();
  return this._headers[key];
}

OutgoingResponse.prototype.write = function (chunk, encoding, callback) {
  return this.socket.write(chunk, encoding, callback);
}

OutgoingResponse.prototype.end = function (chunk, encoding, callback) {
  this.finished = true;
  this.socket.end(data, encoding);
}

module.exports = OutgoingResponse;
