var http = require('http')
const port = 8889
http.createServer(function (req, res){
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.end('Hello World\n')
}).listen(port, '127.0.0.1')
console.log('server running at http://127.0.0.1:' + port)

