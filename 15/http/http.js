var http = require('http')
var fs = require('fs')



http.createServer(function (req, res) {
  var data
  try {
    data = fs.readFileSync('./' + req.url)
    // res.writeHead(200, { 'Cache-Control': 'max-age=100000' });
    res.writeHead(200, { 'Expires': new Date('2020/10/10').toLocaleString() });
  } catch(e) {
    res.writeHead(404)
  }
  res.end(data)
})
.listen(80, '0.0.0.0')