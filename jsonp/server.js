var data = {
    name: 'xiongnima',
    age: 18,
    job: 'Front-End Engineer'
}

const http = require('http')
const url = require('url')

http.createServer(function (req, res) {
    var params = url.parse(req.url, true)
    if(params.query && params.query.callback){
        var str = params.query.callback + '(' + JSON.stringify(data) +')'
        res.end(str)
    }else{
        res.end(JSON.stringify(data))
    }
    console.log(params) 
}).listen(8888, function(){
    console.log('Server is listening on port 8888')
})