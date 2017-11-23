var data = {
    name: 'xiongnima',
    age: 18,
    job: 'Front-End Engineer'
}
var port = 8888
const http = require('http')
const url = require('url')
const fs = require('fs')

http.createServer(function (req, res) {
    var params = url.parse(req.url, true)
    console.log(`Request for ${params.pathname} received.`)
    if(!params.query.callback){
        console.log('////////')
        fs.readFile('./index.html', function(err, data){
            if(err){
                console.log(err)
                res.writeHead(404, {'Content-type': 'text/html'})
            }else{
                res.writeHead(200, {'Content-type':'text/html'})
                res.write(data.toString())
            }
            res.end()
        })
    }else if(params.query && params.query.callback){
        console.log('jsonp')
        var str = params.query.callback + '(' + JSON.stringify(data) +')'
        res.end(str)
    }else{
        res.end(JSON.stringify(data))
    }
}).listen(port, function(){
    console.log(`Server is listening on port ${port}. click: http://localhost:${port}`)
})