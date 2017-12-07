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
  // var reqPath = url.parse(req.url, true)

  // if (reqPath.pathname) {
  //   fs.readFile(path.join('/', reqPath.pathname), function (err, file) {
  //     if (err) {
  //       console.log('Can not find the file.')
  //       res.writeHead(404)
  //       res.end('找不到该路径的文件')
  //     }
  //     res.writeHead(200)
  //     res.end(file)
  //   })
  // }

  // 查询字符串
  // var query = reqPath.query
  // console.log('do something with query string')
  // if (Object.keys(query).length) console.log(query)


  // Cookie
  // cookieHandle(req, res)

  // session
  session(req, res)


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

// 为了设置cookie的可选参数，我们使用一个函数序列化cookie的值，构造一个匹配好的cookie数组
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

function session(req, res) {
  const sessions = {}
  var key = 'Session_id'
  var EXPIRES = 60 * 1000 // 6000ms 
  
  req.cookies = parseCookie(req.headers.cookie)
  // 取cookie
  var id = req.cookies[key];

  // 下面使用req.session 来挂载将返回的新session
  // 如果没有Session_id 字段
  if (!id) {
    req.session = sessionGenerate(sessions, {
      key: key,
      EXPIRES: EXPIRES
    })
  } else {
    var session = sessions[id]
    // 取出已经保存对应的id的session对象
    if (session) {
      if (session.cookie.expire > (new Date()).getTime()) {
        // 如果session 还未超时 ,重写对应sessions里面这条session的时间，即更新session时间
        session.cookie.expire = (new Date()).getTime() + EXPIRES
        req.session = session // 除了重写内存的sessions 还需要更改req.session
      } else {
        // 如果超时
        delete sessions[id]
        req.session = sessionGenerate(sessions, {
          key: key,
          EXPIRES: EXPIRES
        })
      }
    } else {
      // 如果没有对应的session，将创建新的session
      req.session = sessionGenerate(sessions, {
        key: key,
        EXPIRES: EXPIRES
      })
    }
  } // end

  // 这里主要做的事情是处理response的设置，用于在响应中返回session对应的cookie
  var writeHead = res.writeHead;
  // 缓存原方法
  res.writeHead = function () {
    var cookies = res.getHeader('Set-Cookie')
    // 获取已经设置过的响应的 cookie字段
    console.log('cookies1:', cookies)
    var session = cookiesSerializer(key, req.session.id) // 构造一个session_id 字段的cookie
    // 这里返回的session cookie为 Session_id=id 因此并不反回expire，expire只在服务器通过id进行比对，
    cookies = Array.isArray(cookies) ? cookies.concat(session) : [cookies, session] // 拼接成一个cookies
    res.setHeader('Set-Cookies', cookies)
    console.log('cookies2:', cookies)
    return writeHead.apply(this, arguments)
    // 通过闭包返回原writeHead函数执行
  }

  // 业务逻辑
  
  if (!req.cookies.isVisit) {
    res.setHeader('Set-Cookie', cookiesSerializer('isVisit', '1'))
    console.log('sessions', sessions)
    res.writeHead(200, {
      'Content-type': 'text/plain; charset=UTF-8'
    })
    console.log(res.getHeader('Set-Cookie'))
    res.end('欢迎第一次来到本店')
  } else {
    console.log('sessions', sessions)
    res.writeHead(200, {
      'Content-type': 'text/plain; charset=UTF-8'
    })
    console.log(res.getHeader('Set-Cookie'))
    res.end('欢迎再来')
  }
}


// session生成器
function sessionGenerate(sessions, option) {
  var session = {}
  // 根据信息配置一个session对象
  /**
   * session = 
   * {
   *   id: 时间戳 + 小数
   *   cookie: {
   *     expire: 时间戳 + 延迟时间  
   *   }
   * }
   */
  session.id = (new Date()).getTime() + Math.random()
  session.cookie = {
    expire: (new Date()).getTime() + option.EXPIRES
  }
  sessions[session.id] = session
  // 为sessions 对象新增一个session
  return session
}