
const util = require('util');
const Readable = require('stream').Readable;

function IncomingRequest(socket) {
  Readable.call(this);

  this.socket = socket;
  this.parser = socket.parser;

  this.headers = this.parser.info.headers;
  this.url = this.parser.info.url;
  this.method = this.parser.info.method;
}
util.inherits(IncomingRequest, Readable);


module.exports = IncomingRequest;
