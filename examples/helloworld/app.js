const Server = require('../../lib/ihttp').Server;

const app = new Server(function (req, res) {
  console.log(req);
  res.write(JSON.stringify(req.headers));
  res.end('hello world');
}).listen(3000);
