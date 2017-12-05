import {
  EXDEV
} from 'constants';

var http = require('http')
var url = require('url')
var fs = require('fs')
var path = require('path')

const port = 8889

// Returns a new instance of http.Server.
// http.createServer([requestListener])
// 回调函数添加到 request 事件
http.createServer(function (req, res) {
  // 这个函数两个参数对应两个类：
  // request: http.IncommingMessage
  // response: http.ServerResponse 


  // method 解析
  switch (req.method) {
    case 'POST':
      console.log('Update Something')
      break
    case 'GET':
      console.log('GET Something')
      break
    default:
      console.log('another method')
  }
  // path 解析
  // 第二个参数true时，将会使 query属性转成对象
  var reqPath = url.parse(req.url, true)

  if (reqPath.pathname) {
    fs.readFile(path.join('/', reqPath.pathname), function (err, file) {
      if (err) {
        console.log('Can not find the file.')
        res.writeHead(404)
        res.end('找不到该路径的文件')
      }
      res.writeHead(200)
      res.end(file)
    })
  }

  // 查询字符串
  var query = reqPath.query
  console.log('do something with query string')
  if (Object.keys(query).length) console.log(query)


  // Cookie
  cookieHandle(req, res)

  // res.writeHead(200, {
  //   'Content-Type': 'text/plain'
  // })
  // res.end('Hello World\n')
}).listen(port, '127.0.0.1')
console.log('server running at http://127.0.0.1:' + port)

function cookieHandle(req, res) {
  req.cookies = parseCookie(req.headers.cookie)

  if (!req.cookies.isVisit) {
    console.log('Set cookies')
    res.setHeader('Set-Cookie', cookiesSerializer('isVisit', '1'))
    res.writeHead(200, {
      'Content-type': 'text/plain; charset=UTF-8'
    })
    res.end('欢迎第一次光临')
  } else {
    res.writeHead(200, {
      'Content-type': 'text/plain; charset=UTF-8'
    })
    res.end('欢迎再次光临本店')
  }

}

// 这里是处理 cookie 中间件
function parseCookie(cookie) {
  var cookies = {}
  if (!cookie) {
    return cookies
  }
  var list = cookie.split(';')
  for (var i = 0; i < list.length; i++) {
    var pair = list[i].split('=')
    cookies[pair[0].trim()] = pair[1]
  }
  return cookies
}

// 为了设置cookie的可选参数，我们使用一个函数序列化cookie的值，用于配置它
function cookiesSerializer(name, val, option) {
  var pairs = [`${ encodeURIComponent(name) }=${ encodeURIComponent(val) }`]
  option = option || {}
  // 需要处理以下的参数：
  // path || Domain || Max-Age || Expires || HttpOnly || Secure
  option.path && pairs.push(`Path=${option.path}`)
  option.domain && pairs.push(`Domain=${option.domain}`)
  option.maxAge && pairs.push(`Max-Age=${option.maxAge}`)
  option.expires && pairs.push(`Expires=${option.expires}`)
  option.httpOnly && pairs.push(`HttpOnly`)
  option.secure && pairs.push(`Secure`)

  return pairs.join(';')
}

function sessionHandle(req, res) {

  var sessions = {}
  var key = 'session_id'
  var EXPIRES = 30 * 1000 // 30s
  // session生成器
  var generate = function () {
    var session = {}
    session.id = (new Date()).getTime() + Math.random()
    session.cookie = {
      // 设置cookie 过期时间
      expire: (new Date()).getTime() + EXPIRES
    }
    sessions[session.id] = session
    return session
  }
  req.cookies = parseCookie(req.headers.cookie)
  var id = req.cookies[key]
  if (!id) {
    req.session = generate()
  }else{
    var session = sessions[id]
    if(session){
      if(session.cookie.expire > (new Date()).getTime()){
        session.cookie.expire = (new Date()).getTime() + EXPIRES
        req.session = session
      } else {
        delete sessions[id]
        req.session = generate()
      }
    }
  }
}

function sessionCheck(req, res) {

}