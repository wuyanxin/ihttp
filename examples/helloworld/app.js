const Server = require('../../lib/ihttp').Server;

const app = new Server(function (req, res) {
  var result = JSON.stringify(req.headers);

  console.log(req.method, ' - ', req.url, ' - ', new Date);

  res.writeHead(200, 'TEST OK', {
    'X-Powered-By': 'wuyanxin',
    'Content-Type': 'application/json',
    'Content-Length': result.length
  });
  res.write(result);
  res.end('');
}).listen(3000);
console.log('listening on http://localhost:3000');
