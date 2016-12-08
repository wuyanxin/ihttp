
const util = require('util');
const Writable = require('stream').Writable;

function OutgoingResponse(req) {
  Writable.call(this);

  this.socket = req.socket;
}
util.inherits(OutgoingResponse, Writable);


module.exports = OutgoingResponse;
