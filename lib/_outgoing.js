
const util = require('util');
const Writable = require('stream').Writable;
const CRLF = '\r\n';

const STATUS_CODES = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',                 // RFC 2518, obsoleted by RFC 4918
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',               // RFC 4918
  208: 'Already Reported',
  226: 'IM Used',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',         // RFC 7238
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: 'I\'m a teapot',              // RFC 2324
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',       // RFC 4918
  423: 'Locked',                     // RFC 4918
  424: 'Failed Dependency',          // RFC 4918
  425: 'Unordered Collection',       // RFC 4918
  426: 'Upgrade Required',           // RFC 2817
  428: 'Precondition Required',      // RFC 6585
  429: 'Too Many Requests',          // RFC 6585
  431: 'Request Header Fields Too Large', // RFC 6585
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',    // RFC 2295
  507: 'Insufficient Storage',       // RFC 4918
  508: 'Loop Detected',
  509: 'Bandwidth Limit Exceeded',
  510: 'Not Extended',               // RFC 2774
  511: 'Network Authentication Required' // RFC 6585
};

function OutgoingResponse(req) {
  Writable.call(this);

  this.socket = req.socket;

  this.statusCode = 200;
  this.statusMessage = null;

  this._header = null; // ready for out put
  this._headers = {};
  this._headerNames = {};
  this._headerSent = false;

  this.finished = false;
}
util.inherits(OutgoingResponse, Writable);

OutgoingResponse.prototype.setHeader = function (name, value) {
  // TODO check name and value
  var key = name.toLowerCase();
  this._headers[key] = value;
  this._headerNames[key] = name;
}

OutgoingResponse.prototype.getHeader = function (name) {
  if (arguments.length < 1) {
    throw new Error('"name" argument is required for getHeader(name)');
  }

  var key = name.toLowerCase();
  return this._headers[key];
}

OutgoingResponse.prototype.write = function (chunk, encoding, callback) {
  if (!this._headerSent) {
    chunk = this._header + chunk;
    this._header = null;
    this._headerSent = true;
  }
  return this.socket.write(chunk, encoding, callback);
}

OutgoingResponse.prototype.end = function (chunk, encoding, callback) {
  this.finished = true;
  this.socket.end(chunk, encoding, callback);
}

OutgoingResponse.prototype._storeHeaders = function (firstLine) {
  this._header = firstLine;

  for (var key in this._headers) {
    this._header += this._headerNames[key] + ': ' + this._headers[key] + CRLF;
  }
  this._header += CRLF;
}

OutgoingResponse.prototype.writeHead = function (statusCode, reason, obj) {
  this.statusCode = statusCode;

  if (typeof reason === 'string') {
    this.statusMessage = reason;
  } else {
    obj = reason;
    this.statusMessage = this.statusMessage || STATUS_CODES[statusCode] || 'unknown';
  }

  var statusLine = 'HTTP/1.1 ' + statusCode.toString() + ' ' + this.statusMessage + CRLF;

  for (var key in obj) {
    this.setHeader(key, obj[key]);
  }
  this._storeHeaders(statusLine);
}

module.exports = OutgoingResponse;
