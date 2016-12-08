
const util = require('util');
const Readable = require('stream').Readable;

function IncomingRequest(socket) {
  Readable.call(this);

  this.socket = socket;
}
util.inherits(IncomingRequest, Readable);


module.exports = IncomingRequest;
