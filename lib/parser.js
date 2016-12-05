
const EventEmitter = require('events');
const util = require('util');
const readline = require('readline');
const debug = util.debuglog('ihttp');

const CRLF = '\r\n';

// state
const REQUEST_LINE = 'REQUEST_LINE';
const HEADERS = 'HEADERS';
const BODY_CHUNK = 'BODY_CHUNK';

// listener
const HEADER_COMPLETE = exports.HEADER_COMPLETE = 'headerComplete';
const BODY_COMPLETE = exports.BODY_COMPLETE = 'bodyComplete';

function Parser(socket) {
  EventEmitter.call(this);
  var self = this;
  this.socket = socket;
  this.state = REQUEST_LINE;
  this.info = {
    headers: {},
    rawHeaders: [],
    upgrade: false
  };

  // readline
  this.rl = readline.createInterface({
    input: socket
  });
  this.rl.on('line', function (line) {
    self[self.state](line);
  });
  this.rl.on('pause', function () {
    debug('readline on pause');
  })

}
util.inherits(Parser, EventEmitter);
exports.Parser = Parser;

/**
 * Request line state
 */
var requestExp = /^([A-Z-]+) ([^ ]+) HTTP\/(\d)\.(\d)$/;
Parser.prototype.REQUEST_LINE = function (line) {
  if (!line) {
    return;
  }
  var match = requestExp.exec(line);
  if (match === null) {
    throw parseErrorCode('HPE_INVALID_CONSTANT');
  }
  this.info.method = match[1];
  if (match[1] === 'CONNECT') {
    this.info.upgrade = true;
  }
  this.info.url = match[2];
  this.info.versionMajor = +match[3];
  this.info.versionMinor = +match[4];
  this.body_bytes = 0;
  this.state = 'HEADER';
}

/**
 * Header state
 */
var headerExp = /^([^: \t]+):[ \t]*((?:.*[^ \t])|)/;
Parser.prototype.HEADER = function (line) {
  debug('HEADER', '-', line, '-');
  if (!line.trim()) {
    debug('End HEADER state');
    this.state = BODY_CHUNK;
    this.emit(HEADER_COMPLETE);
    return;
  }

  var match = headerExp.exec(line);
  if (match && match[1]) {
    this.info.rawHeaders.push(match[1]);
    this.info.rawHeaders.push(match[2]);
    var key = match[1].toLowerCase();
    if (typeof this.info.headers[key] === 'string') {
      this.info.headers[key] += ', ' + match[2];
    } else {
      this.info.headers[key] = match[2];
    }
  }
}

/**
 * Body state
 */
Parser.prototype.BODY_CHUNK = function (line) {
  debug('BODY_CHUNK', line);
  return true;
}
