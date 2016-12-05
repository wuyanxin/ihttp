
const net = require('net');
const util = require('util');
const _Parser = require('./parser');
const Parser = _Parser.Parser;
const HEADER_COMPLETE = _Parser.HEADER_COMPLETE;
const debug = util.debuglog('ihttp');

function Server(requestListener) {
  if (!(this instanceof Server)) return new Server(requestListener);
  net.Server.call(this, { allowHalfOpen: true });

  if (requestListener) {
    this.on('request', requestListener);
  }

  this.addListener('connection', connectionListener);
}
util.inherits(Server, net.Server);

var counter = 0;
function connectionListener(socket) {
  var self = this;
  debug('new connection is coming', ++counter);

  var parser = new Parser(socket);
  socket.parser = parser;

  parser.on(HEADER_COMPLETE, function () {
    debug('On HEADER_COMPLETE');
    if (parser.info.method === 'GET' || parser.info.method === 'HEAD') {
      // TODO simple req/res
      var req = parser.info;
      var res = socket;
      self.emit('request', req, res);
    }
  });

  // setTimeout(function () {
  //   debug('response');
  //   socket.write(JSON.stringify(parser.info));
  //   socket.end('hello world');
  // }, 1000);
}

module.exports = {
  Server
};
